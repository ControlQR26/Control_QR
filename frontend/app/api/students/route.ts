import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Student } from '@/models/Student';
import { generateQRDataUrl } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query = search ? {
      $or: [
        { nombres: { $regex: search, $options: 'i' } },
        { apellidos: { $regex: search, $options: 'i' } },
        { codigoEstudiantil: { $regex: search, $options: 'i' } },
        { numeroDocumento: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const students = await Student.find(query).populate('guardianId').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.guardianId || body.guardianId.trim() === '') {
      delete body.guardianId;
    }

    const student = new Student(body);
    await student.save();

    const qrPayload = JSON.stringify({
      studentId: student._id.toString(),
      codigoEstudiantil: student.codigoEstudiantil,
      documento: student.numeroDocumento
    });

    const qrDataUrl = await generateQRDataUrl(qrPayload);
    student.qrCode = qrDataUrl;
    await student.save();

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
