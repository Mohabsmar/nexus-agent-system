import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// POST /api/agent/run - Execute a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, voice, model, provider, budget, timeout, autoConfirm, noMemory, noPlan } = body;

    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const agent = getAgent();
    const result = await agent.run({
      goal,
      voice: voice || false,
      model,
      provider,
      budget,
      timeout,
      autoConfirm,
      noMemory,
      noPlan,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent run error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/agent - Get agent status and stats
export async function GET() {
  try {
    const agent = getAgent();
    const stats = agent.getStats();
    const sessions = agent.getSessions().slice(0, 10);

    return NextResponse.json({
      status: 'ready',
      stats,
      recentSessions: sessions.map(s => ({
        id: s.id,
        goal: s.goal.slice(0, 100),
        status: s.status,
        tokensUsed: s.tokensUsed,
        cost: s.cost,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
    });
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
