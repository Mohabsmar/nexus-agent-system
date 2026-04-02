import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/keys - Get configured API keys (masked)
export async function GET() {
  try {
    const agent = getAgent();
    const security = agent.getSecurity();
    
    const providers = ['anthropic', 'openai', 'groq', 'mistral', 'together', 'google', 'cohere', 'xai', 'deepseek'];
    const keys: Array<{ provider: string; configured: boolean; masked?: string }> = [];
    
    for (const provider of providers) {
      const key = security.getApiKey(provider);
      if (key) {
        // Mask the key for display
        const masked = key.length > 8 
          ? key.slice(0, 4) + '...' + key.slice(-4)
          : '****';
        keys.push({ provider, configured: true, masked });
      } else {
        keys.push({ provider, configured: false });
      }
    }

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Keys fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/keys - Set or delete an API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, key } = body;

    const agent = getAgent();
    const security = agent.getSecurity();

    switch (action) {
      case 'set':
        if (!provider || !key) {
          return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
        }
        
        const result = security.setApiKey(provider, key);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        
        // Also set in voice layer if applicable
        const voice = agent.getVoice();
        voice.setApiKey(provider, key);
        
        return NextResponse.json({ success: true, message: `API key for ${provider} saved` });
      
      case 'delete':
        if (!provider) {
          return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }
        
        const deleted = security.deleteSecret(`${provider}_API_KEY`);
        return NextResponse.json({ success: deleted });
      
      case 'validate':
        if (!provider || !key) {
          return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
        }
        
        const validation = security.validateApiKey(provider, key);
        return NextResponse.json(validation);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Key action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
