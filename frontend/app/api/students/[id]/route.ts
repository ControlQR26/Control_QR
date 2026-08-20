import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Student } from '@/models/Student';
import { generateQRDataUrl } from '@/lib/qr';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const student = await Student.findById(params.id).populate('guardianId');
    if (!student) {
      return NextResponse.json({ success: false, error: 'Estudiante no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Estudiante no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const needsQRUpdate = 
      (body.codigoEstudiantil && body.codigoEstudiantil !== student.codigoEstudiantil) ||
      (body.numeroDocumento && body.numeroDocumento !== student.numeroDocumento);

    Object.assign(student, body);

    if (needsQRUpdate) {
      const qrPayload = JSON.stringify({
        studentId: student._id.toString(),
        codigoEstudiantil: student.codigoEstudiantil,
        documento: student.numeroDocumento
      });
      student.qrCode = await generateQRDataUrl(qrPayload);
    }

    await student.save();
    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await Student.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Estudiante eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
