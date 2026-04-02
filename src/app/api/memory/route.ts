import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/memory - Get memory items or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    const agent = getAgent();
    const memory = agent.getMemory();

    if (query) {
      const results = {
        episodes: memory.searchEpisodes(query),
        knowledge: memory.searchKnowledge(query, 5),
      };
      return NextResponse.json({ results });
    }

    const stats = memory.getStats();

    let episodes = memory.listEpisodes(20);
    let procedures = memory.listProcedures();
    let preferences = memory.getAllPreferences();

    return NextResponse.json({
      stats,
      episodes,
      procedures,
      preferences,
      working: memory.getWorkingMemory(),
    });
  } catch (error) {
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/memory - Add or update memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, type, tags, key, value, category } = body;

    const agent = getAgent();
    const memory = agent.getMemory();

    switch (action) {
      case 'add_knowledge':
        const item = memory.addKnowledge(content, { source: 'user', type: type || 'knowledge' }, tags || []);
        return NextResponse.json({ success: true, item });
      
      case 'set_preference':
        memory.setPreference(key, value, category || 'general');
        return NextResponse.json({ success: true });
      
      case 'clear_working':
        memory.clearWorkingMemory();
        return NextResponse.json({ success: true });
      
      case 'export':
        const data = memory.exportAll();
        return NextResponse.json(data);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
