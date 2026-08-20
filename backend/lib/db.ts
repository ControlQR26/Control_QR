import mongoose from 'mongoose';
import '../models/User';
import '../models/Guardian';
import '../models/Student';
import '../models/Teacher';
import '../models/Subject';
import '../models/Schedule';
import '../models/AccessLog';
import '../models/Notification';

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in your deployment settings.');
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  };
  
  await mongoose.connect(uri, opts);
  return mongoose;
}

export default dbConnect;


