import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { AccessLog } from '@/models/AccessLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const query = studentId ? { studentId } : {};

    const logs = await AccessLog.find(query)
      .populate('studentId')
      .populate('subjectId')
      .populate('teacherId')
      .sort({ timestamp: -1 });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
