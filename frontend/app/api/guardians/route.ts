import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Guardian } from '@/models/Guardian';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query = search ? {
      nombreCompleto: { $regex: search, $options: 'i' }
    } : {};

    const guardians = await Guardian.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, guardians });
  } catch (error: any) {
    console.error('Error fetching guardians:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const guardian = await Guardian.create(body);
    return NextResponse.json({ success: true, guardian });
  } catch (error: any) {
    console.error('Error creating guardian:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
