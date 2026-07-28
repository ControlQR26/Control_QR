import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchedule extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  dia: 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
  horaInicio: string; // Formato "HH:MM" ej "07:00"
  horaFin: string; // Formato "HH:MM" ej "09:00"
  aula?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dia: { type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'], required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    aula: { type: String },
  },
  { timestamps: true }
);

export const Schedule: Model<ISchedule> = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
