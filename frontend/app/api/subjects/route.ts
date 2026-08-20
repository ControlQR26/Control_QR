import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Subject } from '@/models/Subject';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query = search ? {
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const subjects = await Subject.find(query).populate('docenteId').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, subjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const subject = await Subject.create(body);
    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
