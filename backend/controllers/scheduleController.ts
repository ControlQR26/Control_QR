import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Schedule } from '../models/Schedule';

export async function getSchedules(req: Request, res: Response) {
  try {
    await dbConnect();
    const studentId = req.query.studentId as string;

    const query = studentId ? { studentId } : {};

    const schedules = await Schedule.find(query)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId')
      .sort({ dia: 1, horaInicio: 1 });

    return res.json({ success: true, schedules });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getScheduleById(req: Request, res: Response) {
  try {
    await dbConnect();
    const schedule = await Schedule.findById(req.params.id)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId');
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Horario no encontrado' });
    }
    return res.json({ success: true, schedule });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    await dbConnect();
    const schedule = await Schedule.create(req.body);
    return res.json({ success: true, schedule });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSchedule(req: Request, res: Response) {
  try {
    await dbConnect();
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Horario no encontrado' });
    }
    return res.json({ success: true, schedule });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    await dbConnect();
    await Schedule.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Horario eliminado' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
