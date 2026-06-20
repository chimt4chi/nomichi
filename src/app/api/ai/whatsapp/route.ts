import { NextResponse } from 'next/server';
import { draftWhatsAppMessage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, what_they_hope_trip_feels_like, trip_name, owner_name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing lead name' }, { status: 400 });
    }

    const message = await draftWhatsAppMessage({ name, what_they_hope_trip_feels_like, trip_name, owner_name });
    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('API whatsapp error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
