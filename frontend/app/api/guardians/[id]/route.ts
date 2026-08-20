import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Guardian } from '@/models/Guardian';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const guardian = await Guardian.findById(params.id);
    if (!guardian) {
      return NextResponse.json({ success: false, error: 'Acudiente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, guardian });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const guardian = await Guardian.findByIdAndUpdate(params.id, body, { new: true });
    if (!guardian) {
      return NextResponse.json({ success: false, error: 'Acudiente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, guardian });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await Guardian.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Acudiente eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
