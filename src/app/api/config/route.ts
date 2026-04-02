import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/config - Get current configuration
export async function GET() {
  try {
    const agent = getAgent();
    const security = agent.getSecurity();
    const voice = agent.getVoice();
    const memory = agent.getMemory();
    const evaluator = agent.getEvaluator();

    return NextResponse.json({
      permissions: security.getPermissions(),
      privacyMode: security.isPrivacyMode(),
      voice: voice.getConfig(),
      memory: {
        stats: memory.getStats(),
        preferences: memory.getAllPreferences(),
      },
      evaluation: evaluator.getStats(),
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/config - Update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const agent = getAgent();
    const security = agent.getSecurity();
    const voice = agent.getVoice();
    const memory = agent.getMemory();

    switch (action) {
      case 'set_permission':
        security.setPermission(params.category, params.action, params.level);
        return NextResponse.json({ success: true });
      
      case 'set_privacy_mode':
        security.setPrivacyMode(params.enabled);
        return NextResponse.json({ success: true, privacyMode: params.enabled });
      
      case 'set_preference':
        memory.setPreference(params.key, params.value, params.category || 'general');
        return NextResponse.json({ success: true });
      
      case 'reset_permissions':
        security.reset();
        return NextResponse.json({ success: true });
      
      case 'set_alias':
        // Store in memory as preference
        memory.setPreference('alias', params.alias, 'general');
        return NextResponse.json({ success: true, alias: params.alias });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
