import { NextResponse } from 'next/server';
import { readLeadVibe } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, group_type, what_they_hope_trip_feels_like, trip_name } = body;
    
    if (!name || !group_type || !what_they_hope_trip_feels_like) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const vibe = await readLeadVibe({ name, group_type, what_they_hope_trip_feels_like, trip_name });
    return NextResponse.json({ vibe });
  } catch (error: any) {
    console.error('API vibe error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
