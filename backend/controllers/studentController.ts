import { Request, Response } from 'express';
import dbConnect from '../lib/db';
import { Student } from '../models/Student';
import { generateQRDataUrl } from '../lib/qr';

export async function getStudents(req: Request, res: Response) {
  try {
    await dbConnect();
    const search = (req.query.search as string) || '';

    const query = search ? {
      $or: [
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
        { codigoEstudiantil: { $regex: search, $options: 'i' } },
        { numeroDocumento: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const students = await Student.find(query).populate('guardianId').sort({ createdAt: -1 });
    return res.json({ success: true, students });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getStudentById(req: Request, res: Response) {
  try {
    await dbConnect();
    const student = await Student.findById(req.params.id).populate('guardianId');
    if (!student) {
      return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    }
    return res.json({ success: true, student });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createStudent(req: Request, res: Response) {
  try {
    await dbConnect();
    const student = new Student(req.body);
    await student.save();

    const qrPayload = JSON.stringify({
      studentId: student._id.toString(),
      codigoEstudiantil: student.codigoEstudiantil,
      documento: student.numeroDocumento
    });

    const qrDataUrl = await generateQRDataUrl(qrPayload);
    student.qrCode = qrDataUrl;
    await student.save();

    return res.json({ success: true, student });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateStudent(req: Request, res: Response) {
  try {
    await dbConnect();
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
    }

    const needsQRUpdate = 
      req.body.codigoEstudiantil !== student.codigoEstudiantil ||
      req.body.numeroDocumento !== student.numeroDocumento;

    Object.assign(student, req.body);

    if (needsQRUpdate) {
      const qrPayload = JSON.stringify({
        studentId: student._id.toString(),
        codigoEstudiantil: student.codigoEstudiantil,
        documento: student.numeroDocumento
      });
      student.qrCode = await generateQRDataUrl(qrPayload);
    }

    await student.save();
    return res.json({ success: true, student });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteStudent(req: Request, res: Response) {
  try {
    await dbConnect();
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Estudiante eliminado' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
