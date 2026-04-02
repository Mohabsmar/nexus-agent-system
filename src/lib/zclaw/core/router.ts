// Z-Claw Multi-Provider LLM Router
// Intelligent routing across AI providers with cost optimization and fallback
// Updated April 2025 with LATEST models

import { 
  ProviderName, 
  Provider, 
  RoutingDecision, 
  TaskNodeType 
} from './types';

// Provider registry with LATEST 2025 models
const PROVIDER_REGISTRY: Record<ProviderName, Provider> = {
  anthropic: {
    name: 'anthropic',
    models: [
      'claude-opus-4-6',        // Latest flagship, 1M context
      'claude-sonnet-4-6',      // Best value, 1M context
      'claude-opus-4-5',        // Previous flagship
      'claude-sonnet-4-5',      // Extended context
      'claude-haiku-4-5',       // Fast, cost-efficient
    ],
    apiBase: 'https://api.anthropic.com',
    auth: 'ANTHROPIC_API_KEY',
    strengths: ['reasoning', 'coding', 'long_context', 'safety', 'extended_thinking'],
    status: 'healthy',
    latency: 800,
    costPerToken: 0.000003,
  },
  openai: {
    name: 'openai',
    models: [
      'gpt-5.4-pro',            // Latest flagship, 1.05M context
      'gpt-5.4',                // Standard flagship
      'gpt-5.4-mini',           // Cost-efficient
      'gpt-5.4-nano',           // Fastest, cheapest
      'gpt-4.1',                // 1M context
      'gpt-4.1-mini',           // Efficient variant
      'o3',                     // Advanced reasoning
      'o3-pro',                 // Premium reasoning
      'o4-mini',                // Efficient reasoning
      'gpt-5-codex',            // Code-specialized
    ],
    apiBase: 'https://api.openai.com',
    auth: 'OPENAI_API_KEY',
    strengths: ['vision', 'function_calling', 'structured_output', 'math', 'reasoning', 'code'],
    status: 'healthy',
    latency: 600,
    costPerToken: 0.000005,
  },
  groq: {
    name: 'groq',
    models: [
      'llama-4-maverick',       // Latest, 1M context, ultra-fast
      'llama-4-scout',          // Efficient variant
      'llama-3.3-70b-versatile', // Previous flagship
      'mixtral-8x7b-32768',     // Huge context
      'gemma-2-9b-it',          // Tiny but fast
    ],
    apiBase: 'https://api.groq.com/openai/v1',
    auth: 'GROQ_API_KEY',
    strengths: ['speed', 'cost', 'open_weights', 'streaming', 'ultra_low_latency'],
    status: 'healthy',
    latency: 50,  // Sub-100ms!
    costPerToken: 0.0000002,
  },
  mistral: {
    name: 'mistral',
    models: [
      'mistral-large-3-2512',   // Latest flagship
      'mistral-small-4',        // Efficient, capable
      'devstral-2-2512',        // Code-specialized
      'codestral-2508',         // Code generation
      'ministral-3-14b',        // Edge deployment
      'voxtral-small-24b',      // Audio-native
      'pixtral-large',          // Vision model
    ],
    apiBase: 'https://api.mistral.ai/v1',
    auth: 'MISTRAL_API_KEY',
    strengths: ['european_data', 'code', 'embeddings', 'open_weights', 'audio', 'vision'],
    status: 'healthy',
    latency: 400,
    costPerToken: 0.0000005,
  },
  together: {
    name: 'together',
    models: [
      'meta-llama/Llama-4-Maverick-17B-128E-Instruct',  // Latest Llama
      'meta-llama/Llama-4-Scout-17B-16E-Instruct',
      'deepseek-ai/DeepSeek-V3.2',                     // Latest DeepSeek
      'Qwen/Qwen3-72B-Instruct',                       // Latest Qwen
      'mistralai/Mistral-Large-3-2512',
    ],
    apiBase: 'https://api.together.xyz/v1',
    auth: 'TOGETHER_API_KEY',
    strengths: ['open_weights', 'fine_tuning', 'batch', 'variety'],
    status: 'healthy',
    latency: 500,
    costPerToken: 0.0000006,
  },
  google: {
    name: 'google',
    models: [
      'gemini-3.1-pro-preview',      // Latest generation
      'gemini-3-flash-preview',      // Fast, efficient
      'gemini-3.1-flash-lite-preview', // Ultra-efficient
      'gemini-2.5-pro',              // Production-ready
      'gemini-2.5-flash',            // Fast inference
      'gemma-3-27b',                 // Open weights
    ],
    apiBase: 'https://generativelanguage.googleapis.com',
    auth: 'GOOGLE_API_KEY',
    strengths: ['multimodal', 'google_search', 'long_context', 'vision', 'image_gen'],
    status: 'healthy',
    latency: 700,
    costPerToken: 0.000002,
  },
  cohere: {
    name: 'cohere',
    models: [
      'command-a',                   // Latest flagship
      'command-r-plus-08-2024',      // RAG-optimized
      'command-r-08-2024',           // Efficient RAG
      'command-r7b-12-2024',         // Lightweight
    ],
    apiBase: 'https://api.cohere.ai',
    auth: 'COHERE_API_KEY',
    strengths: ['rag', 'reranking', 'embeddings', 'enterprise', 'multilingual'],
    status: 'healthy',
    latency: 300,
    costPerToken: 0.0000025,
  },
  xai: {
    name: 'xai',
    models: [
      'grok-4.20',                   // 2M CONTEXT!! Largest in market
      'grok-4.20-multi-agent',       // Multi-agent capabilities
      'grok-4.1-fast',               // Ultra-fast with 2M context
      'grok-4',                      // Standard flagship
      'grok-code-fast-1',            // Code-specialized
      'grok-3-mini',                 // Efficient variant
    ],
    apiBase: 'https://api.x.ai/v1',
    auth: 'XAI_API_KEY',
    strengths: ['real_time_info', 'largest_context', 'multi_agent', 'uncensored', 'code'],
    status: 'healthy',
    latency: 400,
    costPerToken: 0.000002,
  },
  deepseek: {
    name: 'deepseek',
    models: [
      'deepseek-v3.2-speciale',      // Latest flagship
      'deepseek-v3.2',               // Standard variant
      'deepseek-r1',                 // Reasoning model
      'r1-distill-llama-70b',        // Reasoning distilled
      'deepseek-coder-v2',           // Code-specialized
    ],
    apiBase: 'https://api.deepseek.com/v1',
    auth: 'DEEPSEEK_API_KEY',
    strengths: ['ultra_cheap', 'reasoning', 'code', 'open_weights', 'chinese'],
    status: 'healthy',
    latency: 600,
    costPerToken: 0.00000026,  // CRAZY CHEAP!
  },
  ollama: {
    name: 'ollama',
    models: [
      'llama4:17b',                  // Llama 4 Maverick local
      'llama3.3:70b',                // Llama 3.3 70B
      'deepseek-r1:70b',             // DeepSeek R1
      'mistral-large3',              // Mistral Large 3
      'gemma3:27b',                  // Gemma 3
      'qwen3:72b',                   // Qwen 3
      'codestral',                   // Code model
    ],
    apiBase: 'http://localhost:11434',
    auth: null,
    strengths: ['privacy', 'offline', 'custom_fine_tunes', 'free', 'uncensored'],
    status: 'healthy',
    latency: 1500,
    costPerToken: 0,
  },
};

// Task type to optimal model mapping (UPDATED FOR 2025!)
const TASK_MODEL_MAPPING: Record<TaskNodeType, { primary: string; fallback: string[] }> = {
  research: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'llama-4-maverick', 'gemini-3-flash-preview'] 
  },
  reasoning: { 
    primary: 'claude-sonnet-4-6', 
    fallback: ['o3', 'gemini-3.1-pro-preview', 'mistral-large-3-2512'] 
  },
  coding: { 
    primary: 'claude-sonnet-4-6', 
    fallback: ['gpt-5-codex', 'devstral-2-2512', 'codestral-2508'] 
  },
  file_op: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'llama-4-scout', 'mistral-small-4'] 
  },
  api_call: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-mini', 'llama-4-scout'] 
  },
  voice: { 
    primary: 'gpt-5.4-nano', 
    fallback: ['claude-haiku-4-5', 'gemini-3-flash-preview'] 
  },
  memory: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'llama-4-scout'] 
  },
  marketplace: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'mistral-small-4'] 
  },
  human_input: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-mini', 'gemini-3-flash-preview'] 
  },
  validation: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'llama-4-scout'] 
  },
  rollback: { 
    primary: 'claude-haiku-4-5', 
    fallback: ['gpt-5.4-nano', 'mistral-small-4'] 
  },
};

export class LLMRouter {
  private providerHealth: Map<ProviderName, { status: string; lastCheck: Date; errors: number }> = new Map();
  private userPreferences: { privacyMode: boolean; costOptimization: boolean; preferredProvider?: ProviderName } = {
    privacyMode: false,
    costOptimization: true,
  };

  constructor() {
    this.initializeProviderHealth();
  }

  private initializeProviderHealth(): void {
    for (const name of Object.keys(PROVIDER_REGISTRY) as ProviderName[]) {
      this.providerHealth.set(name, {
        status: 'healthy',
        lastCheck: new Date(),
        errors: 0,
      });
    }
  }

  // Main routing decision function
  route(taskType: TaskNodeType, context?: { 
    tokensNeeded?: number; 
    latencyBudget?: number; 
    requiresVision?: boolean;
  }): RoutingDecision {
    const { privacyMode, costOptimization, preferredProvider } = this.userPreferences;

    // Privacy mode: route everything to local Ollama
    if (privacyMode) {
      return {
        provider: 'ollama',
        model: 'llama4:17b',
        reason: 'Privacy mode enabled - using local Ollama',
        fallbackChain: [],
      };
    }

    // Get task mapping
    const mapping = TASK_MODEL_MAPPING[taskType];
    const primaryModel = mapping.primary;
    const fallbackChain = mapping.fallback;

    // Find the provider for the primary model
    let selectedProvider = this.findProviderForModel(primaryModel);
    let selectedModel = primaryModel;

    // Check if vision is required
    if (context?.requiresVision) {
      selectedProvider = 'google';
      selectedModel = 'gemini-3.1-pro-preview';
    }

    // Check latency budget - use Groq for ultra-fast inference
    if (context?.latencyBudget && context.latencyBudget < 200) {
      selectedProvider = 'groq';
      selectedModel = 'llama-4-maverick';
    }

    // Check for large context needs - use Grok 4.20 for 2M context!
    if (context?.tokensNeeded && context.tokensNeeded > 100000) {
      selectedProvider = 'xai';
      selectedModel = 'grok-4.20';  // 2M context window!
    }

    // Deep reasoning tasks
    if (taskType === 'reasoning' && context?.tokensNeeded && context.tokensNeeded > 50000) {
      selectedProvider = 'anthropic';
      selectedModel = 'claude-opus-4-6';
    }

    // Check if preferred provider is set
    if (preferredProvider && this.isProviderHealthy(preferredProvider)) {
      const provider = PROVIDER_REGISTRY[preferredProvider];
      selectedProvider = preferredProvider;
      selectedModel = provider.models[0];
    }

    // Cost optimization: use cheaper models for simple tasks
    if (costOptimization && ['research', 'file_op', 'validation'].includes(taskType)) {
      if (this.isProviderHealthy('deepseek')) {
        selectedProvider = 'deepseek';
        selectedModel = 'deepseek-v3.2';
      } else if (this.isProviderHealthy('groq')) {
        selectedProvider = 'groq';
        selectedModel = 'llama-4-maverick';
      }
    }

    // Check provider health and fallback if needed
    if (!this.isProviderHealthy(selectedProvider)) {
      const fallback = this.findHealthyFallback(fallbackChain);
      if (fallback) {
        selectedProvider = fallback.provider;
        selectedModel = fallback.model;
      }
    }

    return {
      provider: selectedProvider,
      model: selectedModel,
      reason: this.getRoutingReason(taskType, selectedProvider, selectedModel),
      fallbackChain: this.buildFallbackChain(selectedProvider),
    };
  }

  private findProviderForModel(model: string): ProviderName {
    for (const [name, provider] of Object.entries(PROVIDER_REGISTRY) as [ProviderName, Provider][]) {
      if (provider.models.some(m => m.toLowerCase().includes(model.toLowerCase()))) {
        return name;
      }
    }
    return 'anthropic'; // Default fallback
  }

  private isProviderHealthy(provider: ProviderName): boolean {
    const health = this.providerHealth.get(provider);
    return health?.status === 'healthy' && health.errors < 3;
  }

  private findHealthyFallback(models: string[]): { provider: ProviderName; model: string } | null {
    for (const model of models) {
      const provider = this.findProviderForModel(model);
      if (this.isProviderHealthy(provider)) {
        return { provider, model };
      }
    }
    return null;
  }

  private buildFallbackChain(primaryProvider: ProviderName): string[] {
    const chain: string[] = [];
    const providers = Object.keys(PROVIDER_REGISTRY) as ProviderName[];
    
    for (const provider of providers) {
      if (provider !== primaryProvider && this.isProviderHealthy(provider)) {
        chain.push(`${provider}/${PROVIDER_REGISTRY[provider].models[0]}`);
      }
    }
    
    // Always add local Ollama as last resort
    if (this.isProviderHealthy('ollama')) {
      chain.push('ollama/llama4:17b');
    }
    
    return chain;
  }

  private getRoutingReason(taskType: TaskNodeType, provider: ProviderName, model: string): string {
    const reasons: Record<TaskNodeType, string> = {
      research: 'Fast model selected for research tasks',
      reasoning: 'High-capability model for complex reasoning',
      coding: 'Code-specialized model selected',
      file_op: 'Lightweight model for file operations',
      api_call: 'Efficient model for API interactions',
      voice: 'Low-latency model for voice tasks',
      memory: 'Fast model for memory operations',
      marketplace: 'Efficient model for marketplace searches',
      human_input: 'Responsive model for user interaction',
      validation: 'Quick model for validation tasks',
      rollback: 'Reliable model for rollback operations',
    };
    return `${reasons[taskType]} → ${provider}/${model}`;
  }

  // Report provider error
  reportError(provider: ProviderName): void {
    const health = this.providerHealth.get(provider);
    if (health) {
      health.errors++;
      if (health.errors >= 3) {
        health.status = 'degraded';
      }
    }
  }

  // Report provider success
  reportSuccess(provider: ProviderName, latency: number): void {
    const health = this.providerHealth.get(provider);
    if (health) {
      health.errors = 0;
      health.status = 'healthy';
      health.lastCheck = new Date();
    }
    PROVIDER_REGISTRY[provider].latency = latency;
  }

  // Set user preferences
  setPreferences(prefs: Partial<typeof this.userPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...prefs };
  }

  // Get all providers
  getProviders(): Provider[] {
    return Object.values(PROVIDER_REGISTRY);
  }

  // Get provider by name
  getProvider(name: ProviderName): Provider | undefined {
    return PROVIDER_REGISTRY[name];
  }

  // Get provider health status
  getHealthStatus(): Array<{ provider: ProviderName; status: string; errors: number }> {
    const status: Array<{ provider: ProviderName; status: string; errors: number }> = [];
    for (const [provider, health] of this.providerHealth.entries()) {
      status.push({
        provider,
        status: health.status,
        errors: health.errors,
      });
    }
    return status;
  }
}

// Singleton instance
let routerInstance: LLMRouter | null = null;

export function getRouter(): LLMRouter {
  if (!routerInstance) {
    routerInstance = new LLMRouter();
  }
  return routerInstance;
}

export { PROVIDER_REGISTRY };
