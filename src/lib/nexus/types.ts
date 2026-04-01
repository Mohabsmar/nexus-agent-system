// NEXUS - Next-Generation Extensible Unified Agent System
// Core Type Definitions

// ==================== Provider Types ====================

export type ProviderName = 'anthropic' | 'openai' | 'groq' | 'mistral' | 'together' | 'google' | 'cohere' | 'xai' | 'deepseek' | 'ollama';

export interface Provider {
  name: ProviderName;
  models: string[];
  apiBase: string;
  auth: string | null;
  strengths: string[];
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  costPerToken: number;
}

export interface ModelCapabilities {
  reasoning: number;
  coding: number;
  vision: boolean;
  longContext: boolean;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
}

export interface RoutingDecision {
  provider: ProviderName;
  model: string;
  reason: string;
  fallbackChain: string[];
}

// ==================== Task & DAG Types ====================

export type TaskNodeType = 'research' | 'reasoning' | 'coding' | 'file_op' | 'api_call' | 'voice' | 'memory' | 'marketplace' | 'human_input' | 'validation' | 'rollback';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export interface TaskNode {
  id: string;
  type: TaskNodeType;
  description: string;
  status: TaskStatus;
  dependencies: string[];
  result?: unknown;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface DAG {
  id: string;
  goal: string;
  nodes: Map<string, TaskNode>;
  edges: Array<{ from: string; to: string }>;
  parallelGroups: string[][];
  createdAt: Date;
  status: TaskStatus;
}

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  tokensUsed: number;
  cost: number;
  duration: number;
}

// ==================== Memory Types ====================

export interface WorkingMemory {
  context: string[];
  maxItems: number;
}

export interface EpisodicMemory {
  id: string;
  sessionId: string;
  timestamp: Date;
  summary: string;
  keyFacts: string[];
  outcome: 'success' | 'failure' | 'partial';
  tags: string[];
  toolsUsed: string[];
  modelUsed: string;
  cost: number;
  duration: number;
}

export interface SemanticMemory {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    source: string;
    type: 'code' | 'knowledge' | 'solution' | 'document';
    createdAt: Date;
    accessCount: number;
  };
  tags: string[];
}

export interface ProceduralMemory {
  id: string;
  skillName: string;
  description: string;
  steps: string[];
  examples: string[];
  successRate: number;
  lastUpdated: Date;
}

export interface UserPreference {
  key: string;
  value: unknown;
  category: 'editor' | 'language' | 'voice' | 'provider' | 'general';
  updatedAt: Date;
}

// ==================== Voice Types ====================

export type TTSProvider = 'elevenlabs' | 'openai_tts' | 'coqui' | 'pyttsx3';
export type STTProvider = 'whisper_openai' | 'whisper_local' | 'deepgram' | 'assemblyai';
export type VoicePersona = 'professional' | 'assistant' | 'developer' | 'teacher';

export interface VoiceConfig {
  ttsProvider: TTSProvider;
  sttProvider: STTProvider;
  persona: VoicePersona;
  enabled: boolean;
  wakeWord: string;
  voice: string;
  speed: number;
}

export interface AudioAlert {
  type: 'task_started' | 'task_completed' | 'error' | 'waiting' | 'memory_saved' | 'tool_installed';
  sound: string;
}

// ==================== Skill Types ====================

export type MarketplaceSource = 'clawdhub' | 'smithery' | 'npm' | 'github' | 'composio' | 'opentools' | 'mcp_hub' | 'local';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  source: MarketplaceSource;
  version: string;
  author: string;
  rating: number;
  installCount: number;
  installed: boolean;
  path?: string;
  capabilities: string[];
  dependencies: string[];
  config?: Record<string, unknown>;
}

export interface SkillSearchResult {
  skill: Skill;
  relevanceScore: number;
  installSize: string;
}

// ==================== Tool Types ====================

export type ToolCategory = 'file_system' | 'shell' | 'web' | 'code' | 'database' | 'ai' | 'git' | 'communication';

export interface Tool {
  name: string;
  category: ToolCategory;
  description: string;
  parameters: JSONSchema;
  requiredParams: string[];
  destructive: boolean;
  requiresConfirmation: boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: string[];
  description?: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: unknown;
  error?: string;
  retryCount: number;
}

export interface SelfHealingResult {
  success: boolean;
  recoveredFrom: 'retry' | 'fallback' | 'replacement' | 'user_intervention';
  attempts: number;
  finalError?: string;
}

// ==================== Security Types ====================

export type PermissionLevel = 'granted' | 'ask' | 'require_confirm' | 'denied';

export interface Permissions {
  fileSystem: {
    read: PermissionLevel;
    write: PermissionLevel;
    delete: PermissionLevel;
  };
  network: {
    outboundHttp: PermissionLevel;
    sendEmail: PermissionLevel;
    postSocial: PermissionLevel;
  };
  shell: {
    runCommands: PermissionLevel;
    installPackages: PermissionLevel;
    runAsRoot: PermissionLevel;
  };
  llmProviders: {
    sendUserData: PermissionLevel;
    privacyMode: boolean;
  };
}

export interface Secret {
  key: string;
  provider: string;
  createdAt: Date;
  lastUsed?: Date;
}

// ==================== Evaluation Types ====================

export interface EvaluationScore {
  taskCompletion: number;
  efficiency: number;
  toolSelection: number;
  errorHandling: number;
  memoryUtilization: number;
  voiceQuality: number;
  overall: number;
}

export interface ImprovementNote {
  id: string;
  category: 'efficiency' | 'tool_selection' | 'memory' | 'cost' | 'voice';
  description: string;
  suggestion: string;
  createdAt: Date;
  applied: boolean;
}

// ==================== Checkpoint Types ====================

export interface Checkpoint {
  id: string;
  timestamp: Date;
  description: string;
  snapshot: {
    files: Record<string, string>;
    memory: string[];
    taskState: string;
  };
  canRollback: boolean;
}

// ==================== Sub-Agent Types ====================

export type SubAgentRole = 'researcher' | 'coder' | 'critic' | 'planner' | 'voice_narrator';

export interface SubAgent {
  id: string;
  role: SubAgentRole;
  model: string;
  tools: string[];
  status: 'idle' | 'working' | 'completed' | 'failed';
  currentTask?: string;
  output?: unknown;
}

export interface OrchestrationPattern {
  type: 'pipeline' | 'debate' | 'supervisor';
  agents: SubAgent[];
  flow: string[];
}

// ==================== Session Types ====================

export interface Session {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  goal: string;
  dag?: DAG;
  status: TaskStatus;
  tokensUsed: number;
  cost: number;
  provider: ProviderName;
  model: string;
  checkpoints: Checkpoint[];
  toolsCalled: ToolCall[];
  memoryAccessed: string[];
  evaluation?: EvaluationScore;
}

// ==================== API Types ====================

export interface RunRequest {
  goal: string;
  voice?: boolean;
  model?: string;
  provider?: ProviderName;
  budget?: number;
  timeout?: number;
  autoConfirm?: boolean;
  noMemory?: boolean;
  noPlan?: boolean;
}

export interface RunResponse {
  sessionId: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  metrics: {
    tokensUsed: number;
    cost: number;
    duration: number;
    toolsUsed: number;
  };
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalRuns: number;
  successRate: number;
  totalTokens: number;
  totalCost: number;
  averageDuration: number;
  activeProviders: number;
  installedSkills: number;
  memoryEntries: number;
}

export interface ProviderHealth {
  name: ProviderName;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  errorRate: number;
  lastChecked: Date;
}

export interface CostBreakdown {
  provider: ProviderName;
  tokens: number;
  cost: number;
  percentage: number;
}

// ==================== Config Types ====================

export interface NexusConfig {
  alias: string;
  defaultProvider: ProviderName;
  defaultModel: string;
  voice: VoiceConfig;
  permissions: Permissions;
  privacyMode: boolean;
  costOptimization: boolean;
  maxRetries: number;
  timeout: number;
  dashboardPort: number;
  dataDir: string;
}
