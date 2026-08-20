import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Teacher } from '@/models/Teacher';

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
      ]
    } : {};

    const teachers = await Teacher.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, teachers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const teacher = await Teacher.create(body);
    return NextResponse.json({ success: true, teacher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
