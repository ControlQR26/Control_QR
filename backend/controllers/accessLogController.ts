import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { AccessLog } from '../models/AccessLog';

export async function getAccessLogs(req: Request, res: Response) {
  try {
    await dbConnect();
    const studentId = req.query.studentId as string;

    const query = studentId ? { studentId } : {};

    const logs = await AccessLog.find(query)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId')
      .sort({ timestamp: -1 });

    return res.json({ success: true, logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
