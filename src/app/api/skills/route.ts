import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/skills - Get skills or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const installed = searchParams.get('installed');

    const agent = getAgent();
    const marketplace = agent.getMarketplace();

    if (installed === 'true') {
      const skills = marketplace.getInstalled();
      return NextResponse.json({ skills });
    }

    if (query) {
      const results = await marketplace.search(query);
      return NextResponse.json({ results });
    }

    // Get marketplace info
    const marketplaces = marketplace.getMarketplaces();
    const stats = marketplace.getStats();

    return NextResponse.json({
      marketplaces,
      stats,
      installed: marketplace.getInstalled(),
    });
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/skills - Install or uninstall skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, slug, source } = body;

    const agent = getAgent();
    const marketplace = agent.getMarketplace();

    switch (action) {
      case 'install':
        const skill = await marketplace.install(slug, source);
        return NextResponse.json({ success: true, skill });
      
      case 'uninstall':
        const removed = await marketplace.uninstall(slug);
        return NextResponse.json({ success: removed });
      
      case 'update':
        const result = await marketplace.updateAll();
        return NextResponse.json(result);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Skill action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
