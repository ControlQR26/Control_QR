import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  programa: string;
  telegramChatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true, unique: true, index: true },
    telefono: { type: String, required: true },
    programa: { type: String, required: true },
    telegramChatId: { type: String, required: false },
  },
  { timestamps: true }
);

export const Teacher: Model<ITeacher> = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
