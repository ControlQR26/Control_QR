import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  tipoDestinatario: 'acudiente' | 'docente';
  destinatario: string; // Correo o Teléfono
  mensaje: string;
  fecha: Date;
  estado: 'enviada' | 'simulada' | 'pendiente';
  accessLogId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tipoDestinatario: { type: String, enum: ['acudiente', 'docente'], required: true },
    destinatario: { type: String, required: true },
    mensaje: { type: String, required: true },
    fecha: { type: Date, required: true, default: Date.now },
    estado: { type: String, enum: ['enviada', 'simulada', 'pendiente'], default: 'simulada' },
    accessLogId: { type: Schema.Types.ObjectId, ref: 'AccessLog', required: true, index: true },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
