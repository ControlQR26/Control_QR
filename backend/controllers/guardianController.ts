import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Guardian } from '../models/Guardian';

export async function getGuardians(req: Request, res: Response) {
  try {
    await dbConnect();
    const search = (req.query.search as string) || '';

    const query = search ? {
      nombreCompleto: { $regex: search, $options: 'i' }
    } : {};

    const guardians = await Guardian.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, guardians });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getGuardianById(req: Request, res: Response) {
  try {
    await dbConnect();
    const guardian = await Guardian.findById(req.params.id);
    if (!guardian) {
      return res.status(404).json({ success: false, error: 'Acudiente no encontrado' });
    }
    return res.json({ success: true, guardian });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createGuardian(req: Request, res: Response) {
  try {
    await dbConnect();
    const guardian = await Guardian.create(req.body);
    return res.json({ success: true, guardian });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateGuardian(req: Request, res: Response) {
  try {
    await dbConnect();
    const guardian = await Guardian.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guardian) {
      return res.status(404).json({ success: false, error: 'Acudiente no encontrado' });
    }
    return res.json({ success: true, guardian });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteGuardian(req: Request, res: Response) {
  try {
    await dbConnect();
    await Guardian.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Acudiente eliminado' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
