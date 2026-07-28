import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Teacher } from '../models/Teacher';

export async function getTeachers(req: Request, res: Response) {
  try {
    await dbConnect();
    const search = (req.query.search as string) || '';

    const query = search ? {
      $or: [
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const teachers = await Teacher.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, teachers });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getTeacherById(req: Request, res: Response) {
  try {
    await dbConnect();
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Docente no encontrado' });
    }
    return res.json({ success: true, teacher });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createTeacher(req: Request, res: Response) {
  try {
    await dbConnect();
    const teacher = await Teacher.create(req.body);
    return res.json({ success: true, teacher });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateTeacher(req: Request, res: Response) {
  try {
    await dbConnect();
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Docente no encontrado' });
    }
    return res.json({ success: true, teacher });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteTeacher(req: Request, res: Response) {
  try {
    await dbConnect();
    await Teacher.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Docente eliminado' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
