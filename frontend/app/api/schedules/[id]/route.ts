import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Schedule } from '@/models/Schedule';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const schedule = await Schedule.findById(params.id)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId');
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Horario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const schedule = await Schedule.findByIdAndUpdate(params.id, body, { new: true });
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Horario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await Schedule.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Horario eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
