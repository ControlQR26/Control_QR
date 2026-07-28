import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuardian extends Document {
  nombreCompleto: string;
  parentesco: string;
  correo: string;
  telefono: string;
  telegramChatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuardianSchema = new Schema<IGuardian>(
  {
    nombreCompleto: { type: String, required: true },
    parentesco: { type: String, required: true },
    correo: { type: String, required: true, index: true },
    telefono: { type: String, required: true },
    telegramChatId: { type: String, required: false },
  },
  { timestamps: true }
);

export const Guardian: Model<IGuardian> = mongoose.models.Guardian || mongoose.model<IGuardian>('Guardian', GuardianSchema);
