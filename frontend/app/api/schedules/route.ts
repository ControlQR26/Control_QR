import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Schedule } from '@/models/Schedule';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const query = studentId ? { studentId } : {};

    const schedules = await Schedule.find(query)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId')
      .sort({ dia: 1, horaInicio: 1 });

    return NextResponse.json({ success: true, schedules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const schedule = await Schedule.create(body);
    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
