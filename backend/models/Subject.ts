import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
  nombre: string;
  codigo: string;
  docenteId: mongoose.Types.ObjectId;
  programaAcademico: string;
  cursoSugerido: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    nombre: { type: String, required: true },
    codigo: { type: String, required: true, unique: true, index: true },
    docenteId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    programaAcademico: { type: String, required: true },
    cursoSugerido: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Subject: Model<ISubject> = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
