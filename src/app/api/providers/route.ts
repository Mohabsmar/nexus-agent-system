import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/zclaw';

// GET /api/providers - Get all providers and their status
export async function GET() {
  try {
    const agent = getAgent();
    const router = agent.getRouter();
    
    const providers = router.getProviders();
    const healthStatus = router.getHealthStatus();

    return NextResponse.json({
      providers: providers.map(p => ({
        name: p.name,
        models: p.models,
        strengths: p.strengths,
        status: healthStatus.find(h => h.provider === p.name)?.status || p.status,
        latency: p.latency,
        costPerToken: p.costPerToken,
      })),
      health: healthStatus,
    });
  } catch (error) {
    console.error('Providers fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/providers - Update provider settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, model } = body;

    const agent = getAgent();
    const router = agent.getRouter();

    switch (action) {
      case 'set_default':
        router.setPreferences({ preferredProvider: provider });
        return NextResponse.json({ success: true, message: `Default provider set to ${provider}` });
      
      case 'test':
        // Simulate provider test
        return NextResponse.json({ 
          success: true, 
          provider,
          latency: Math.floor(Math.random() * 500) + 100,
          status: 'healthy',
        });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Provider update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
