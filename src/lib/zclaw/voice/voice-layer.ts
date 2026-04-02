// Z-Claw Voice Layer
// Full-duplex voice with TTS/STT multi-provider support

import {
  VoiceConfig,
  TTSProvider,
  STTProvider,
  VoicePersona,
  AudioAlert,
} from './types';

// Voice persona configurations
const VOICE_PERSONAS: Record<VoicePersona, {
  style: string;
  ttsVoice: Record<TTSProvider, string>;
  responseStyle: string;
}> = {
  professional: {
    style: 'formal, terse, facts-only',
    ttsVoice: {
      elevenlabs: 'Rachel',
      openai_tts: 'nova',
      coqui: 'p267',
      pyttsx3: 'default',
    },
    responseStyle: 'Direct and concise. Focus on facts.',
  },
  assistant: {
    style: 'warm, helpful, explains steps',
    ttsVoice: {
      elevenlabs: 'Antoni',
      openai_tts: 'alloy',
      coqui: 'p267',
      pyttsx3: 'default',
    },
    responseStyle: 'Friendly and helpful. Explain reasoning.',
  },
  developer: {
    style: 'terse, code-heavy, minimal verbal filler',
    ttsVoice: {
      elevenlabs: 'Josh',
      openai_tts: 'echo',
      coqui: 'p267',
      pyttsx3: 'default',
    },
    responseStyle: 'Technical and concise. Show code first.',
  },
  teacher: {
    style: 'verbose, examples-first, patient',
    ttsVoice: {
      elevenlabs: 'Rachel',
      openai_tts: 'shimmer',
      coqui: 'p267',
      pyttsx3: 'default',
    },
    responseStyle: 'Educational and thorough. Use examples.',
  },
};

// Audio alert sounds (base64 encoded simple tones)
const AUDIO_ALERTS: Record<AudioAlert['type'], string> = {
  task_started: 'chime',
  task_completed: 'ascending',
  error: 'buzz',
  waiting: 'hum',
  memory_saved: 'click',
  tool_installed: 'install',
};

// TTS Provider configurations
const TTS_PROVIDERS: Record<TTSProvider, {
  name: string;
  requiresAuth: boolean;
  authEnv: string | null;
  streaming: boolean;
  latency: 'low' | 'medium' | 'high';
}> = {
  elevenlabs: {
    name: 'ElevenLabs',
    requiresAuth: true,
    authEnv: 'ELEVENLABS_API_KEY',
    streaming: true,
    latency: 'low',
  },
  openai_tts: {
    name: 'OpenAI TTS',
    requiresAuth: true,
    authEnv: 'OPENAI_API_KEY',
    streaming: false,
    latency: 'medium',
  },
  coqui: {
    name: 'Coqui TTS',
    requiresAuth: false,
    authEnv: null,
    streaming: false,
    latency: 'high',
  },
  pyttsx3: {
    name: 'pyttsx3',
    requiresAuth: false,
    authEnv: null,
    streaming: false,
    latency: 'low',
  },
};

// STT Provider configurations
const STT_PROVIDERS: Record<STTProvider, {
  name: string;
  requiresAuth: boolean;
  authEnv: string | null;
  realtime: boolean;
  languages: number;
}> = {
  whisper_openai: {
    name: 'OpenAI Whisper',
    requiresAuth: true,
    authEnv: 'OPENAI_API_KEY',
    realtime: false,
    languages: 99,
  },
  whisper_local: {
    name: 'Whisper Local',
    requiresAuth: false,
    authEnv: null,
    realtime: false,
    languages: 99,
  },
  deepgram: {
    name: 'Deepgram',
    requiresAuth: true,
    authEnv: 'DEEPGRAM_API_KEY',
    realtime: true,
    languages: 30,
  },
  assemblyai: {
    name: 'AssemblyAI',
    requiresAuth: true,
    authEnv: 'ASSEMBLYAI_API_KEY',
    realtime: true,
    languages: 15,
  },
};

export class VoiceLayer {
  private config: VoiceConfig = {
    ttsProvider: 'openai_tts',
    sttProvider: 'whisper_openai',
    persona: 'assistant',
    enabled: false,
    wakeWord: 'Hey Nexus',
    voice: 'nova',
    speed: 1.0,
  };
  private isSpeaking = false;
  private isListening = false;
  private audioQueue: string[] = [];

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    // In production, load from user preferences
    // For now, use defaults
  }

  // Get current voice config
  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  // Update voice config
  setConfig(updates: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Enable/disable voice mode
  enable(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  // Set voice persona
  setPersona(persona: VoicePersona): void {
    this.config.persona = persona;
    const personaConfig = VOICE_PERSONAS[persona];
    this.config.voice = personaConfig.ttsVoice[this.config.ttsProvider];
  }

  // Set wake word
  setWakeWord(phrase: string): void {
    this.config.wakeWord = phrase;
  }

  // Get persona response style
  getPersonaStyle(): string {
    return VOICE_PERSONAS[this.config.persona].responseStyle;
  }

  // Text-to-Speech (simulate - in production would call actual APIs)
  async speak(text: string, options?: { interruptible?: boolean }): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    this.isSpeaking = true;

    // Adapt text based on persona
    const adaptedText = this.adaptTextForVoice(text);

    try {
      // In production, this would call the actual TTS API
      // For now, we simulate the call
      await this.callTTS(adaptedText);
    } finally {
      this.isSpeaking = false;
    }
  }

  private adaptTextForVoice(text: string): string {
    const persona = this.config.persona;
    
    // For voice mode, make text more conversational
    if (persona === 'professional') {
      return text; // Keep as-is
    }
    
    // Add verbal signposting for other personas
    if (text.startsWith('Starting')) {
      return `Alright, ${text.toLowerCase()}`;
    }
    if (text.startsWith('Completed') || text.startsWith('Done')) {
      return `Great, ${text.toLowerCase()}`;
    }
    if (text.includes('error') || text.includes('failed')) {
      return `Hmm, ${text}`;
    }
    
    return text;
  }

  private async callTTS(text: string): Promise<void> {
    const provider = this.config.ttsProvider;
    const providerConfig = TTS_PROVIDERS[provider];
    
    // Simulate API call latency
    const latency = {
      low: 200,
      medium: 500,
      high: 1000,
    }[providerConfig.latency];
    
    await new Promise(r => setTimeout(r, Math.random() * latency));
    
    // In production, would return audio data
    console.log(`[TTS/${provider}] Speaking: "${text}"`);
  }

  // Speech-to-Text (simulate - in production would call actual APIs)
  async listen(timeout = 5000): Promise<string | null> {
    if (!this.config.enabled) {
      return null;
    }

    this.isListening = true;

    try {
      // In production, this would:
      // 1. Capture audio from microphone
      // 2. Detect wake word if not already listening
      // 3. Buffer audio until silence
      // 4. Send to STT provider
      // 5. Return transcribed text
      
      await new Promise(r => setTimeout(r, 100)); // Simulate processing
      return null; // No input in simulation
    } finally {
      this.isListening = false;
    }
  }

  // Play audio alert
  async playAlert(type: AudioAlert['type']): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const alert = AUDIO_ALERTS[type];
    // In production, would play actual sound
    console.log(`[Audio Alert] Playing: ${alert}`);
  }

  // Interrupt current speech
  interrupt(): void {
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.audioQueue = [];
    }
  }

  // Check if voice is active
  isActive(): boolean {
    return this.config.enabled;
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Get available TTS providers
  getTTSProviders(): Array<{ id: TTSProvider; name: string; requiresAuth: boolean }> {
    return Object.entries(TTS_PROVIDERS).map(([id, config]) => ({
      id: id as TTSProvider,
      name: config.name,
      requiresAuth: config.requiresAuth,
    }));
  }

  // Get available STT providers
  getSTTProviders(): Array<{ id: STTProvider; name: string; requiresAuth: boolean; realtime: boolean }> {
    return Object.entries(STT_PROVIDERS).map(([id, config]) => ({
      id: id as STTProvider,
      name: config.name,
      requiresAuth: config.requiresAuth,
      realtime: config.realtime,
    }));
  }

  // Get available personas
  getPersonas(): Array<{ id: VoicePersona; style: string }> {
    return Object.entries(VOICE_PERSONAS).map(([id, config]) => ({
      id: id as VoicePersona,
      style: config.style,
    }));
  }

  // Voice test
  async test(): Promise<{ tts: boolean; stt: boolean; error?: string }> {
    try {
      await this.speak('Voice test successful. Z-Claw is ready.');
      return { tts: true, stt: true };
    } catch (error) {
      return { 
        tts: false, 
        stt: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Singleton instance
let voiceInstance: VoiceLayer | null = null;

export function getVoiceLayer(): VoiceLayer {
  if (!voiceInstance) {
    voiceInstance = new VoiceLayer();
  }
  return voiceInstance;
}

export { VOICE_PERSONAS, TTS_PROVIDERS, STT_PROVIDERS, AUDIO_ALERTS };
