import { NextResponse } from 'next/server';
import { summarizeCallLogs } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { logs } = body;

    if (!logs) {
      return NextResponse.json({ error: 'Missing logs' }, { status: 400 });
    }

    const summary = await summarizeCallLogs(logs);
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('API summary error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
