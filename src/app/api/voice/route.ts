import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/nexus';

// GET /api/voice - Get voice configuration
export async function GET() {
  try {
    const agent = getAgent();
    const voice = agent.getVoice();

    const config = voice.getConfig();
    const ttsProviders = voice.getTTSProviders();
    const sttProviders = voice.getSTTProviders();
    const personas = voice.getPersonas();

    return NextResponse.json({
      config,
      providers: {
        tts: ttsProviders,
        stt: sttProviders,
      },
      personas,
      status: {
        active: voice.isActive(),
        speaking: voice.isCurrentlySpeaking(),
        listening: voice.isCurrentlyListening(),
      },
    });
  } catch (error) {
    console.error('Voice fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/voice - Update voice configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const agent = getAgent();
    const voice = agent.getVoice();

    switch (action) {
      case 'enable':
        voice.enable(params.enabled);
        return NextResponse.json({ success: true, enabled: params.enabled });
      
      case 'set_persona':
        voice.setPersona(params.persona);
        return NextResponse.json({ success: true, persona: params.persona });
      
      case 'set_provider':
        voice.setConfig({
          ttsProvider: params.tts,
          sttProvider: params.stt,
        });
        return NextResponse.json({ success: true });
      
      case 'set_wake_word':
        voice.setWakeWord(params.wakeWord);
        return NextResponse.json({ success: true, wakeWord: params.wakeWord });
      
      case 'test':
        const result = await voice.test();
        return NextResponse.json(result);
      
      case 'speak':
        await voice.speak(params.text);
        return NextResponse.json({ success: true });
      
      case 'interrupt':
        voice.interrupt();
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Voice action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
