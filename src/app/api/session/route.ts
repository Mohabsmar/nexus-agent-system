import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/session - Get all sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    const agent = getAgent();

    if (sessionId) {
      const session = agent.getSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json(session);
    }

    const sessions = agent.getSessions();
    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        goal: s.goal,
        status: s.status,
        provider: s.provider,
        model: s.model,
        tokensUsed: s.tokensUsed,
        cost: s.cost,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        evaluation: s.evaluation,
      })),
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
