import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Teacher } from '@/models/Teacher';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const teacher = await Teacher.findById(params.id);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Docente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const teacher = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Docente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await Teacher.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Docente eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
