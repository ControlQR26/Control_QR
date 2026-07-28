import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Notification } from '../models/Notification';

export async function getNotifications(req: Request, res: Response) {
  try {
    await dbConnect();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return res.json({ success: true, notifications });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
