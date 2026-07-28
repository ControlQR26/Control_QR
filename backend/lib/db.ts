import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Define where the mock database JSON is stored
const MOCK_DB_FILE = path.join(process.cwd(), 'mock_db.json');

function readMockDb() {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    // Pre-initialize structure
    const initialDb = {
      User: [],
      Student: [],
      Guardian: [],
      Teacher: [],
      Subject: [],
      Schedule: [],
      AccessLog: [],
      Notification: []
    };
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function writeMockDb(data: any) {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const populateMap: Record<string, string> = {
  guardianId: 'Guardian',
  docenteId: 'Teacher',
  studentId: 'Student',
  subjectId: 'Subject',
  teacherId: 'Teacher'
};

function resolvePopulate(item: any, pathStr: string, dbData: any) {
  const fields = pathStr.split(/\s+/).filter(Boolean);
  for (const field of fields) {
    const targetModel = populateMap[field];
    if (targetModel && item[field]) {
      const refId = typeof item[field] === 'object' && item[field]._id ? item[field]._id.toString() : String(item[field]);
      const targetList = dbData[targetModel] || [];
      const refDoc = targetList.find((d: any) => String(d._id) === refId);
      if (refDoc) {
        item[field] = { ...refDoc };
      }
    }
  }
}

function matchesQuery(item: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  const matchField = (itemVal: any, queryVal: any): boolean => {
    if (queryVal && typeof queryVal === 'object') {
      if (queryVal.$regex !== undefined) {
        const flags = queryVal.$options || '';
        const regex = new RegExp(queryVal.$regex, flags);
        return regex.test(String(itemVal || ''));
      }
    }
    return String(itemVal) === String(queryVal);
  };

  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const orArray = query[key];
      if (Array.isArray(orArray)) {
        const matchesAny = orArray.some(subQuery => {
          return Object.keys(subQuery).every(subKey => {
            return matchField(item[subKey], subQuery[subKey]);
          });
        });
        if (!matchesAny) return false;
      }
    } else {
      if (!matchField(item[key], query[key])) {
        return false;
      }
    }
  }

  return true;
}

function sortItems(items: any[], sortObj: any): any[] {
  if (!sortObj) return items;
  return [...items].sort((a, b) => {
    for (const key of Object.keys(sortObj)) {
      const direction = sortObj[key];
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      return direction === -1 ? -comparison : comparison;
    }
    return 0;
  });
}

class MockQuery {
  private modelName: string;
  private data: any[];
  private populatePaths: string[] = [];
  private sortObj: any = null;

  constructor(modelName: string, data: any[]) {
    this.modelName = modelName;
    this.data = data.map(item => ({ ...item }));
  }

  populate(path: string) {
    if (path) {
      this.populatePaths.push(path);
    }
    return this;
  }

  sort(sortObj: any) {
    this.sortObj = sortObj;
    return this;
  }

  limit(num: number) {
    this.data = this.data.slice(0, num);
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const db = readMockDb();
      let result = this.data;
      
      if (this.populatePaths.length > 0) {
        for (const item of result) {
          for (const pathStr of this.populatePaths) {
            resolvePopulate(item, pathStr, db);
          }
        }
      }
      
      if (this.sortObj) {
        result = sortItems(result, this.sortObj);
      }

      return onfulfilled ? onfulfilled(result) : result;
    } catch (e) {
      if (onrejected) return onrejected(e);
      throw e;
    }
  }
}

// Monkey-patch Mongoose Model methods
const originalFind = mongoose.Model.find;
const originalFindOne = mongoose.Model.findOne;
const originalFindById = mongoose.Model.findById;
const originalCreate = mongoose.Model.create;
const originalFindByIdAndUpdate = mongoose.Model.findByIdAndUpdate;
const originalFindByIdAndDelete = mongoose.Model.findByIdAndDelete;
const originalDeleteMany = mongoose.Model.deleteMany;
const originalCountDocuments = mongoose.Model.countDocuments;
const originalAggregate = mongoose.Model.aggregate;
const originalSave = mongoose.Model.prototype.save;

mongoose.Model.countDocuments = function(this: any, query: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    const list = db[modelName] || [];
    const matched = !query || Object.keys(query).length === 0 ? list : list.filter((item: any) => matchesQuery(item, query));
    return {
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled(matched.length) : matched.length;
      }
    } as any;
  }
  return originalCountDocuments.apply(this, arguments as any);
};

mongoose.Model.aggregate = function(this: any, pipeline: any) {
  if ((global as any).useMockDb) {
    return {
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled([]) : [];
      }
    } as any;
  }
  return originalAggregate.apply(this, arguments as any);
};

mongoose.Model.find = function(this: any, query: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    const list = db[modelName] || [];
    const matched = list.filter((item: any) => matchesQuery(item, query));
    return new MockQuery(modelName, matched) as any;
  }
  return originalFind.apply(this, arguments as any);
};

mongoose.Model.findOne = function(this: any, query: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    const list = db[modelName] || [];
    const item = list.find((i: any) => matchesQuery(i, query));
    const cloned = item ? { ...item } : null;

    return {
      populate: function(path: string) {
        if (cloned && path) {
          resolvePopulate(cloned, path, db);
        }
        return this;
      },
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled(cloned) : cloned;
      }
    } as any;
  }
  return originalFindOne.apply(this, arguments as any);
};

mongoose.Model.findById = function(this: any, id: any) {
  if ((global as any).useMockDb) {
    return this.findOne({ _id: String(id) });
  }
  return originalFindById.apply(this, arguments as any);
};

mongoose.Model.create = async function(this: any, docOrDocs: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    if (!db[modelName]) db[modelName] = [];
    
    const docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
    const createdDocs = [];
    
    for (const data of docs) {
      const doc = { ...data };
      if (!doc._id) {
        doc._id = new mongoose.Types.ObjectId().toString();
      } else {
        doc._id = String(doc._id);
      }
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      
      Object.defineProperty(doc, 'save', {
        value: async function() {
          const innerDb = readMockDb();
          const list = innerDb[modelName] || [];
          const idx = list.findIndex((d: any) => String(d._id) === String(this._id));
          this.updatedAt = new Date().toISOString();
          if (idx >= 0) {
            list[idx] = { ...this };
          } else {
            list.push({ ...this });
          }
          innerDb[modelName] = list;
          writeMockDb(innerDb);
          return this;
        },
        enumerable: false,
        writable: true
      });
      
      db[modelName].push(doc);
      createdDocs.push(doc);
    }
    
    writeMockDb(db);
    return Array.isArray(docOrDocs) ? createdDocs : createdDocs[0];
  }
  return originalCreate.apply(this, arguments as any);
} as any;

mongoose.Model.findByIdAndUpdate = function(this: any, id: any, update: any, options: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    const list = db[modelName] || [];
    const idx = list.findIndex((item: any) => String(item._id) === String(id));
    if (idx >= 0) {
      const fields = update.$set || update;
      list[idx] = { ...list[idx], ...fields, updatedAt: new Date().toISOString() };
      db[modelName] = list;
      writeMockDb(db);
      const updatedItem = { ...list[idx] };
      return {
        then: async function(onfulfilled?: any) {
          return onfulfilled ? onfulfilled(updatedItem) : updatedItem;
        }
      } as any;
    }
    return {
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled(null) : null;
      }
    } as any;
  }
  return originalFindByIdAndUpdate.apply(this, arguments as any);
};

mongoose.Model.findByIdAndDelete = function(this: any, id: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    const list = db[modelName] || [];
    const idx = list.findIndex((item: any) => String(item._id) === String(id));
    let deletedItem = null;
    if (idx >= 0) {
      deletedItem = { ...list.splice(idx, 1)[0] };
      db[modelName] = list;
      writeMockDb(db);
    }
    return {
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled(deletedItem) : deletedItem;
      }
    } as any;
  }
  return originalFindByIdAndDelete.apply(this, arguments as any);
};

mongoose.Model.deleteMany = function(this: any, query: any) {
  if ((global as any).useMockDb) {
    const modelName = this.modelName;
    const db = readMockDb();
    if (!query || Object.keys(query).length === 0) {
      db[modelName] = [];
    } else {
      const list = db[modelName] || [];
      db[modelName] = list.filter((item: any) => !matchesQuery(item, query));
    }
    writeMockDb(db);
    return {
      then: async function(onfulfilled?: any) {
        return onfulfilled ? onfulfilled({ deletedCount: 1 }) : { deletedCount: 1 };
      }
    } as any;
  }
  return originalDeleteMany.apply(this, arguments as any);
};

mongoose.Model.prototype.save = async function(this: any) {
  if ((global as any).useMockDb) {
    const modelName = this.constructor.modelName;
    const db = readMockDb();
    if (!db[modelName]) db[modelName] = [];
    
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId().toString();
    } else {
      this._id = String(this._id);
    }
    
    const plainDoc = this.toObject ? this.toObject() : JSON.parse(JSON.stringify(this));
    if (!plainDoc._id) {
      plainDoc._id = this._id;
    }
    
    const idx = db[modelName].findIndex((d: any) => String(d._id) === String(plainDoc._id));
    plainDoc.updatedAt = new Date().toISOString();
    if (!plainDoc.createdAt) {
      plainDoc.createdAt = new Date().toISOString();
    }
    
    if (idx >= 0) {
      db[modelName][idx] = plainDoc;
    } else {
      db[modelName].push(plainDoc);
    }
    writeMockDb(db);
    return this;
  }
  return originalSave.apply(this);
};

import '../models/User';
import '../models/Guardian';
import '../models/Student';
import '../models/Teacher';
import '../models/Subject';
import '../models/Schedule';
import '../models/AccessLog';
import '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sena_id';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  };
  
  await mongoose.connect(MONGODB_URI, opts);
  console.log('Successfully connected to MongoDB!');
  return mongoose;
}

export default dbConnect;
