import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Subject } from '@/models/Subject';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const subject = await Subject.findById(params.id).populate('docenteId');
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Asignatura no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const subject = await Subject.findByIdAndUpdate(params.id, body, { new: true });
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Asignatura no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await Subject.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Asignatura eliminada' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
