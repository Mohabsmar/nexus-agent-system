// Z-Claw - Zero-Compromise Learning & Agent Workbench
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

export interface ZClawConfig {
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

// ==================== Marketplace Types ====================

export type MarketplaceCategory = 
  | 'skills' 
  | 'agents' 
  | 'plugins' 
  | 'templates' 
  | 'providers' 
  | 'themes' 
  | 'workflows' 
  | 'prompts' 
  | 'voices' 
  | 'integrations';

export type MarketplaceSort = 'popular' | 'recent' | 'rating' | 'downloads' | 'name';

export interface MarketplaceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: MarketplaceCategory;
  source: MarketplaceSource;
  version: string;
  author: AuthorInfo;
  rating: number;
  reviewCount: number;
  installCount: number;
  downloadCount: number;
  installed: boolean;
  featured: boolean;
  verified: boolean;
  price: 'free' | 'freemium' | 'paid';
  priceAmount?: number;
  currency?: string;
  tags: string[];
  capabilities: string[];
  dependencies: string[];
  compatibility: CompatibilityInfo;
  screenshots?: string[];
  documentationUrl?: string;
  repositoryUrl?: string;
  homepageUrl?: string;
  license: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  config?: Record<string, unknown>;
}

export interface AuthorInfo {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified: boolean;
  partner: boolean;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

export interface CompatibilityInfo {
  minVersion: string;
  maxVersion?: string;
  platforms: ('macos' | 'windows' | 'linux' | 'web')[];
  requires: string[];
}

export interface MarketplaceReview {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
  reply?: {
    author: string;
    content: string;
    createdAt: Date;
  };
}

export interface MarketplaceCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  curator: AuthorInfo;
  itemCount: number;
  followers: number;
  items: MarketplaceItem[];
  tags: string[];
  featured: boolean;
  createdAt: Date;
}

export interface MarketplaceSearchFilters {
  query?: string;
  category?: MarketplaceCategory;
  source?: MarketplaceSource;
  tags?: string[];
  author?: string;
  price?: ('free' | 'freemium' | 'paid')[];
  rating?: number;
  installed?: boolean;
  featured?: boolean;
  verified?: boolean;
  compatible?: boolean;
  sortBy?: MarketplaceSort;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MarketplaceSearchResult {
  items: MarketplaceItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  aggregations: {
    categories: Record<MarketplaceCategory, number>;
    sources: Record<MarketplaceSource, number>;
    tags: Array<{ tag: string; count: number }>;
  };
}

// ==================== Agent Marketplace Types ====================

export interface AgentTemplate extends MarketplaceItem {
  category: 'agents';
  role: SubAgentRole;
  systemPrompt: string;
  defaultModel: string;
  defaultProvider: ProviderName;
  tools: string[];
  skills: string[];
  behavior: AgentBehavior;
  examples: AgentExample[];
}

export interface AgentBehavior {
  temperature: number;
  maxTokens: number;
  responseStyle: 'concise' | 'detailed' | 'balanced';
  reasoning: boolean;
  streaming: boolean;
  voiceEnabled: boolean;
}

export interface AgentExample {
  input: string;
  output: string;
  description: string;
}

// ==================== Plugin Marketplace Types ====================

export interface Plugin extends MarketplaceItem {
  category: 'plugins';
  type: 'extension' | 'integration' | 'channel' | 'provider';
  entrypoint: string;
  permissions: string[];
  settings: PluginSetting[];
  hooks: PluginHook[];
}

export interface PluginSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'password';
  label: string;
  description?: string;
  default?: unknown;
  options?: Array<{ label: string; value: string }>;
  required: boolean;
  secret: boolean;
}

export interface PluginHook {
  event: string;
  handler: string;
  priority: number;
}

// ==================== Template Marketplace Types ====================

export interface Template extends MarketplaceItem {
  category: 'templates';
  type: 'project' | 'workflow' | 'agent-config' | 'skill-config';
  files: TemplateFile[];
  variables: TemplateVariable[];
  postInstall?: string[];
}

export interface TemplateFile {
  path: string;
  content: string;
  type: 'text' | 'binary' | 'template';
}

export interface TemplateVariable {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  default?: unknown;
  options?: string[];
  required: boolean;
  validation?: string;
}

// ==================== Workflow Marketplace Types ====================

export interface Workflow extends MarketplaceItem {
  category: 'workflows';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: WorkflowTrigger[];
  variables: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'voice';
  config: Record<string, unknown>;
}

// ==================== Prompt Marketplace Types ====================

export interface PromptTemplate extends MarketplaceItem {
  category: 'prompts';
  content: string;
  variables: string[];
  examples: PromptExample[];
  category_tags: string[];
}

export interface PromptExample {
  variables: Record<string, string>;
  output: string;
}

// ==================== Voice Marketplace Types ====================

export interface VoicePack extends MarketplaceItem {
  category: 'voices';
  provider: TTSProvider;
  voiceId: string;
  preview?: string;
  languages: string[];
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'senior';
  accent?: string;
  style: string[];
}

// ==================== Integration Marketplace Types ====================

export interface Integration extends MarketplaceItem {
  category: 'integrations';
  service: string;
  authType: 'oauth' | 'api_key' | 'basic' | 'none';
  scopes: string[];
  setupSteps: IntegrationStep[];
  webhooks?: WebhookConfig[];
}

export interface IntegrationStep {
  order: number;
  title: string;
  description: string;
  action: 'redirect' | 'input' | 'confirm' | 'wait';
  url?: string;
  fields?: IntegrationField[];
}

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  required: boolean;
  placeholder?: string;
}

export interface WebhookConfig {
  event: string;
  description: string;
  payloadExample?: Record<string, unknown>;
}

// ==================== Theme Marketplace Types ====================

export interface Theme extends MarketplaceItem {
  category: 'themes';
  type: 'light' | 'dark' | 'system';
  colors: ThemeColors;
  fonts: ThemeFonts;
  customCss?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  [key: string]: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

// ==================== Marketplace Stats Types ====================

export interface MarketplaceStats {
  totalItems: number;
  totalDownloads: number;
  totalReviews: number;
  categories: Record<MarketplaceCategory, number>;
  trending: MarketplaceItem[];
  featured: MarketplaceItem[];
  newReleases: MarketplaceItem[];
  topAuthors: AuthorInfo[];
}

export interface MarketplaceInstallResult {
  success: boolean;
  item?: MarketplaceItem;
  error?: string;
  installPath?: string;
  postInstallSteps?: string[];
}
