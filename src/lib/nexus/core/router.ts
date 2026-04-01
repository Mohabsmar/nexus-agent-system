// NEXUS Multi-Provider LLM Router
// Intelligent routing across AI providers with cost optimization and fallback

import { 
  ProviderName, 
  Provider, 
  RoutingDecision, 
  TaskNodeType 
} from './types';

// Provider registry with model information
const PROVIDER_REGISTRY: Record<ProviderName, Provider> = {
  anthropic: {
    name: 'anthropic',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
    apiBase: 'https://api.anthropic.com',
    auth: 'ANTHROPIC_API_KEY',
    strengths: ['reasoning', 'coding', 'long_context', 'safety'],
    status: 'healthy',
    latency: 800,
    costPerToken: 0.000015,
  },
  openai: {
    name: 'openai',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3'],
    apiBase: 'https://api.openai.com',
    auth: 'OPENAI_API_KEY',
    strengths: ['vision', 'function_calling', 'structured_output', 'math'],
    status: 'healthy',
    latency: 600,
    costPerToken: 0.00001,
  },
  groq: {
    name: 'groq',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    apiBase: 'https://api.groq.com/openai/v1',
    auth: 'GROQ_API_KEY',
    strengths: ['speed', 'cost', 'open_weights', 'streaming'],
    status: 'healthy',
    latency: 100,
    costPerToken: 0.0000002,
  },
  mistral: {
    name: 'mistral',
    models: ['mistral-large-latest', 'codestral-latest', 'mistral-embed'],
    apiBase: 'https://api.mistral.ai/v1',
    auth: 'MISTRAL_API_KEY',
    strengths: ['european_data', 'code', 'embeddings'],
    status: 'healthy',
    latency: 400,
    costPerToken: 0.000005,
  },
  together: {
    name: 'together',
    models: ['meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'Qwen/Qwen2.5-Coder-32B-Instruct'],
    apiBase: 'https://api.together.xyz/v1',
    auth: 'TOGETHER_API_KEY',
    strengths: ['open_weights', 'fine_tuning', 'batch'],
    status: 'healthy',
    latency: 500,
    costPerToken: 0.000003,
  },
  google: {
    name: 'google',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro'],
    apiBase: 'https://generativelanguage.googleapis.com',
    auth: 'GOOGLE_API_KEY',
    strengths: ['multimodal', 'google_search', 'long_context'],
    status: 'healthy',
    latency: 700,
    costPerToken: 0.000008,
  },
  cohere: {
    name: 'cohere',
    models: ['command-r-plus', 'embed-english-v3.0'],
    apiBase: 'https://api.cohere.ai',
    auth: 'COHERE_API_KEY',
    strengths: ['rag', 'reranking', 'embeddings'],
    status: 'healthy',
    latency: 300,
    costPerToken: 0.000004,
  },
  ollama: {
    name: 'ollama',
    models: ['llama3.2', 'codellama', 'mistral'],
    apiBase: 'http://localhost:11434',
    auth: null,
    strengths: ['privacy', 'offline', 'custom_fine_tunes', 'free'],
    status: 'healthy',
    latency: 1000,
    costPerToken: 0,
  },
};

// Task type to optimal model mapping
const TASK_MODEL_MAPPING: Record<TaskNodeType, { primary: string; fallback: string[] }> = {
  research: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  reasoning: { primary: 'claude-sonnet-4-6', fallback: ['gpt-4o', 'mistral-large-latest'] },
  coding: { primary: 'claude-sonnet-4-6', fallback: ['gpt-4o', 'codestral-latest'] },
  file_op: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  api_call: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'gemma2-9b-it'] },
  voice: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  memory: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  marketplace: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  human_input: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  validation: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
  rollback: { primary: 'claude-haiku-4-5', fallback: ['gpt-4o-mini', 'llama-3.3-70b-versatile'] },
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
        model: 'llama3.2',
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
      selectedProvider = 'openai';
      selectedModel = 'gpt-4o';
    }

    // Check latency budget
    if (context?.latencyBudget && context.latencyBudget < 500) {
      selectedProvider = 'groq';
      selectedModel = 'llama-3.3-70b-versatile';
    }

    // Check for large context needs
    if (context?.tokensNeeded && context.tokensNeeded > 50000) {
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
    if (costOptimization && taskType in ['research', 'file_op', 'validation']) {
      if (this.isProviderHealthy('groq')) {
        selectedProvider = 'groq';
        selectedModel = 'llama-3.3-70b-versatile';
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
      if (provider.models.includes(model)) {
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
      chain.push('ollama/llama3.2');
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
