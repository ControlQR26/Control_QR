import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessLog extends Document {
  studentId: mongoose.Types.ObjectId;
  fecha: Date;
  hora: string;
  timestamp: Date;
  metodo: 'QR' | 'Manual';
  subjectId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  aula?: string;
  estado: 'validado' | 'estudiante inactivo' | 'sin clase programada' | 'qr inválido';
  mensaje?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccessLogSchema = new Schema<IAccessLog>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    metodo: { type: String, enum: ['QR', 'Manual'], default: 'QR' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    aula: { type: String },
    estado: { type: String, enum: ['validado', 'estudiante inactivo', 'sin clase programada', 'qr inválido'], required: true },
    mensaje: { type: String },
  },
  { timestamps: true }
);

export const AccessLog: Model<IAccessLog> = mongoose.models.AccessLog || mongoose.model<IAccessLog>('AccessLog', AccessLogSchema);
