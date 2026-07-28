import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  codigoEstudiantil: string;
  correoInstitucional: string;
  programaAcademico: string;
  curso: number;
  estado: 'activo' | 'inactivo';
  foto?: string;
  qrCode?: string;
  guardianId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    tipoDocumento: { type: String, required: true },
    numeroDocumento: { type: String, required: true, unique: true, index: true },
    codigoEstudiantil: { type: String, required: true, unique: true, index: true },
    correoInstitucional: { type: String, required: true, unique: true },
    programaAcademico: { type: String, required: true },
    curso: { type: Number, required: true },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
    foto: { type: String },
    qrCode: { type: String },
    guardianId: { type: Schema.Types.ObjectId, ref: 'Guardian' },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
