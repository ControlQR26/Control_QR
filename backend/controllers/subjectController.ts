import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Subject } from '../models/Subject';

export async function getSubjects(req: Request, res: Response) {
  try {
    await dbConnect();
    const search = (req.query.search as string) || '';

    const query = search ? {
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const subjects = await Subject.find(query).populate('docenteId').sort({ createdAt: -1 });
    return res.json({ success: true, subjects });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSubjectById(req: Request, res: Response) {
  try {
    await dbConnect();
    const subject = await Subject.findById(req.params.id).populate('docenteId');
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
    }
    return res.json({ success: true, subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createSubject(req: Request, res: Response) {
  try {
    await dbConnect();
    const subject = await Subject.create(req.body);
    return res.json({ success: true, subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSubject(req: Request, res: Response) {
  try {
    await dbConnect();
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
    }
    return res.json({ success: true, subject });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteSubject(req: Request, res: Response) {
  try {
    await dbConnect();
    await Subject.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Asignatura eliminada' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
