// Z-Claw Unified Marketplace System
// Comprehensive marketplace for skills, agents, plugins, templates, and more

import {
  MarketplaceItem,
  MarketplaceCategory,
  MarketplaceSource,
  MarketplaceSearchFilters,
  MarketplaceSearchResult,
  MarketplaceStats,
  MarketplaceCollection,
  MarketplaceReview,
  MarketplaceInstallResult,
  AgentTemplate,
  Plugin,
  Template,
  Workflow,
  PromptTemplate,
  VoicePack,
  Integration,
  Theme,
  AuthorInfo,
  SubAgentRole,
  ProviderName,
  TTSProvider,
} from '../types';
import { randomUUID } from 'crypto';

// ==================== Sample Data ====================

const SAMPLE_AUTHORS: AuthorInfo[] = [
  {
    id: 'author-1',
    name: 'Mohab',
    username: 'mohabsmar',
    verified: true,
    partner: true,
    bio: 'Creator of Z-Claw. Building the future of AI agents.',
    github: 'Mohabsmar',
  },
  {
    id: 'author-2',
    name: 'VoiceClaw',
    username: 'voiceclaw',
    verified: true,
    partner: true,
    bio: 'Co-builder of Z-Claw. 11-year-old coding prodigy.',
  },
  {
    id: 'author-3',
    name: 'OpenClaw Team',
    username: 'openclaw',
    verified: true,
    partner: true,
    bio: 'The original OpenClaw team',
    github: 'openclaw',
  },
];

const createBaseItem = (
  name: string,
  slug: string,
  category: MarketplaceCategory,
  overrides: Partial<MarketplaceItem> = {}
): MarketplaceItem => ({
  id: randomUUID(),
  name,
  slug,
  description: overrides.description || `${name} for Z-Claw`,
  category,
  source: overrides.source || 'clawdhub',
  version: overrides.version || '1.0.0',
  author: overrides.author || SAMPLE_AUTHORS[0],
  rating: overrides.rating || 4.5,
  reviewCount: overrides.reviewCount || Math.floor(Math.random() * 500),
  installCount: overrides.installCount || Math.floor(Math.random() * 10000),
  downloadCount: overrides.downloadCount || Math.floor(Math.random() * 50000),
  installed: overrides.installed || false,
  featured: overrides.featured || false,
  verified: overrides.verified || true,
  price: overrides.price || 'free',
  tags: overrides.tags || [category],
  capabilities: overrides.capabilities || [],
  dependencies: overrides.dependencies || [],
  compatibility: {
    minVersion: '1.0.0',
    platforms: ['macos', 'windows', 'linux', 'web'],
    requires: [],
  },
  license: 'MIT',
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  ...overrides,
});

// ==================== Sample Agents ====================

const SAMPLE_AGENTS: AgentTemplate[] = [
  {
    ...createBaseItem('Senior Developer Agent', 'senior-developer', 'agents', {
      description: 'An expert software developer agent with deep knowledge of multiple programming languages and best practices',
      featured: true,
      installCount: 25420,
      rating: 4.9,
      tags: ['coding', 'development', 'code-review', 'architecture'],
    }),
    role: 'coder',
    systemPrompt: 'You are a senior software developer with 15+ years of experience...',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultProvider: 'anthropic',
    tools: ['file_read', 'file_write', 'shell', 'git'],
    skills: ['code-analysis', 'testing', 'documentation'],
    behavior: {
      temperature: 0.3,
      maxTokens: 4096,
      responseStyle: 'detailed',
      reasoning: true,
      streaming: true,
      voiceEnabled: false,
    },
    examples: [
      {
        input: 'Review this code for security issues',
        output: 'I found 3 potential security vulnerabilities...',
        description: 'Security code review',
      },
    ],
  },
  {
    ...createBaseItem('Research Analyst Agent', 'research-analyst', 'agents', {
      description: 'Comprehensive research agent that gathers, analyzes, and synthesizes information from multiple sources',
      installCount: 18350,
      rating: 4.8,
      tags: ['research', 'analysis', 'web-search', 'synthesis'],
    }),
    role: 'researcher',
    systemPrompt: 'You are a thorough research analyst...',
    defaultModel: 'gpt-4o',
    defaultProvider: 'openai',
    tools: ['web_search', 'web_scraper', 'pdf_reader'],
    skills: ['web-search', 'summarization'],
    behavior: {
      temperature: 0.5,
      maxTokens: 8192,
      responseStyle: 'detailed',
      reasoning: true,
      streaming: true,
      voiceEnabled: true,
    },
    examples: [],
  },
  {
    ...createBaseItem('Project Manager Agent', 'project-manager', 'agents', {
      description: 'Manages projects, creates tasks, tracks progress, and coordinates between agents',
      installCount: 12800,
      rating: 4.7,
      tags: ['project-management', 'planning', 'coordination', 'tasks'],
    }),
    role: 'planner',
    systemPrompt: 'You are an experienced project manager...',
    defaultModel: 'gpt-4o-mini',
    defaultProvider: 'openai',
    tools: ['task_create', 'task_update', 'calendar', 'notification'],
    skills: ['taskflow', 'github'],
    behavior: {
      temperature: 0.4,
      maxTokens: 2048,
      responseStyle: 'concise',
      reasoning: false,
      streaming: true,
      voiceEnabled: true,
    },
    examples: [],
  },
  {
    ...createBaseItem('Creative Writer Agent', 'creative-writer', 'agents', {
      description: 'Creative writing assistant for content creation, storytelling, and copywriting',
      installCount: 9200,
      rating: 4.6,
      tags: ['writing', 'creative', 'content', 'storytelling'],
    }),
    role: 'coder',
    systemPrompt: 'You are a creative writing expert...',
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultProvider: 'anthropic',
    tools: ['file_write', 'grammar_check', 'style_analysis'],
    skills: ['summarize', 'blogwatcher'],
    behavior: {
      temperature: 0.8,
      maxTokens: 4096,
      responseStyle: 'detailed',
      reasoning: false,
      streaming: true,
      voiceEnabled: true,
    },
    examples: [],
  },
  {
    ...createBaseItem('Data Scientist Agent', 'data-scientist', 'agents', {
      description: 'Expert in data analysis, machine learning, and statistical modeling',
      featured: true,
      installCount: 15600,
      rating: 4.8,
      tags: ['data-science', 'ml', 'analysis', 'statistics', 'python'],
    }),
    role: 'researcher',
    systemPrompt: 'You are a senior data scientist...',
    defaultModel: 'gpt-4o',
    defaultProvider: 'openai',
    tools: ['python_execute', 'data_viz', 'sql_query'],
    skills: ['model-usage'],
    behavior: {
      temperature: 0.3,
      maxTokens: 4096,
      responseStyle: 'detailed',
      reasoning: true,
      streaming: true,
      voiceEnabled: false,
    },
    examples: [],
  },
];

// ==================== Sample Plugins ====================

const SAMPLE_PLUGINS: Plugin[] = [
  {
    ...createBaseItem('Slack Channel Plugin', 'slack-channel', 'plugins', {
      description: 'Connect Z-Claw to Slack workspaces for seamless messaging and automation',
      featured: true,
      installCount: 35000,
      rating: 4.7,
      tags: ['slack', 'messaging', 'communication', 'channel'],
    }),
    type: 'channel',
    entrypoint: './plugins/slack/index.js',
    permissions: ['messages:read', 'messages:write', 'channels:read'],
    settings: [
      {
        key: 'bot_token',
        type: 'password',
        label: 'Bot Token',
        description: 'Your Slack bot token (xoxb-...)',
        required: true,
        secret: true,
      },
      {
        key: 'signing_secret',
        type: 'password',
        label: 'Signing Secret',
        required: true,
        secret: true,
      },
    ],
    hooks: [
      { event: 'message:received', handler: 'handleMessage', priority: 10 },
      { event: 'message:send', handler: 'sendMessage', priority: 10 },
    ],
  },
  {
    ...createBaseItem('Discord Channel Plugin', 'discord-channel', 'plugins', {
      description: 'Full Discord integration for Z-Claw with slash commands and voice support',
      installCount: 28500,
      rating: 4.6,
      tags: ['discord', 'messaging', 'voice', 'channel'],
    }),
    type: 'channel',
    entrypoint: './plugins/discord/index.js',
    permissions: ['bot', 'messages', 'voice'],
    settings: [
      {
        key: 'bot_token',
        type: 'password',
        label: 'Discord Bot Token',
        required: true,
        secret: true,
      },
    ],
    hooks: [],
  },
  {
    ...createBaseItem('GitHub Integration Plugin', 'github-integration', 'plugins', {
      description: 'Deep GitHub integration for issues, PRs, and repository management',
      featured: true,
      installCount: 42000,
      rating: 4.9,
      tags: ['github', 'git', 'issues', 'pull-requests', 'ci'],
    }),
    type: 'integration',
    entrypoint: './plugins/github/index.js',
    permissions: ['repo', 'issues', 'pull_requests'],
    settings: [
      {
        key: 'personal_access_token',
        type: 'password',
        label: 'Personal Access Token',
        required: true,
        secret: true,
      },
    ],
    hooks: [],
  },
  {
    ...createBaseItem('Notion Integration', 'notion-integration', 'plugins', {
      description: 'Sync with Notion workspaces for notes, databases, and project management',
      installCount: 19800,
      rating: 4.5,
      tags: ['notion', 'notes', 'database', 'productivity'],
    }),
    type: 'integration',
    entrypoint: './plugins/notion/index.js',
    permissions: ['databases', 'pages'],
    settings: [
      {
        key: 'api_key',
        type: 'password',
        label: 'Notion API Key',
        required: true,
        secret: true,
      },
    ],
    hooks: [],
  },
  {
    ...createBaseItem('WhatsApp Channel', 'whatsapp-channel', 'plugins', {
      description: 'Connect Z-Claw to WhatsApp for personal and business messaging',
      installCount: 24000,
      rating: 4.4,
      tags: ['whatsapp', 'messaging', 'channel', 'business'],
    }),
    type: 'channel',
    entrypoint: './plugins/whatsapp/index.js',
    permissions: ['messages', 'contacts'],
    settings: [],
    hooks: [],
  },
];

// ==================== Sample Templates ====================

const SAMPLE_TEMPLATES: Template[] = [
  {
    ...createBaseItem('Full-Stack Next.js Starter', 'nextjs-starter', 'templates', {
      description: 'Production-ready Next.js 16 template with TypeScript, Tailwind, Prisma, and authentication',
      featured: true,
      installCount: 55000,
      rating: 4.9,
      tags: ['nextjs', 'typescript', 'fullstack', 'prisma'],
    }),
    type: 'project',
    files: [
      { path: 'package.json', content: '{}', type: 'template' },
      { path: 'tsconfig.json', content: '{}', type: 'text' },
      { path: 'src/app/page.tsx', content: '', type: 'template' },
    ],
    variables: [
      { key: 'projectName', type: 'string', label: 'Project Name', required: true },
      { key: 'database', type: 'select', label: 'Database', options: ['postgresql', 'mysql', 'sqlite'], required: true },
    ],
    postInstall: ['npm install', 'npx prisma db push'],
  },
  {
    ...createBaseItem('AI Chatbot Template', 'ai-chatbot', 'templates', {
      description: 'Ready-to-use AI chatbot with streaming, memory, and multiple LLM providers',
      installCount: 38000,
      rating: 4.8,
      tags: ['ai', 'chatbot', 'llm', 'streaming'],
    }),
    type: 'project',
    files: [],
    variables: [
      { key: 'provider', type: 'select', label: 'Default Provider', options: ['openai', 'anthropic', 'groq'], required: true },
    ],
  },
  {
    ...createBaseItem('API Service Template', 'api-service', 'templates', {
      description: 'RESTful API service with authentication, rate limiting, and OpenAPI docs',
      installCount: 22000,
      rating: 4.6,
      tags: ['api', 'rest', 'nodejs', 'express'],
    }),
    type: 'project',
    files: [],
    variables: [],
  },
];

// ==================== Sample Workflows ====================

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    ...createBaseItem('CI/CD Pipeline Workflow', 'cicd-pipeline', 'workflows', {
      description: 'Automated testing, building, and deployment pipeline for software projects',
      featured: true,
      installCount: 18500,
      rating: 4.8,
      tags: ['cicd', 'automation', 'deployment', 'testing'],
    }),
    nodes: [
      { id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: {}, config: {} },
      { id: '2', type: 'test', position: { x: 200, y: 0 }, data: {}, config: {} },
      { id: '3', type: 'build', position: { x: 400, y: 0 }, data: {}, config: {} },
      { id: '4', type: 'deploy', position: { x: 600, y: 0 }, data: {}, config: {} },
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
    ],
    triggers: [{ type: 'webhook', config: {} }],
    variables: {},
  },
  {
    ...createBaseItem('Customer Support Automation', 'support-automation', 'workflows', {
      description: 'Automated customer support with AI-powered responses and ticket routing',
      installCount: 12000,
      rating: 4.5,
      tags: ['support', 'automation', 'customer-service', 'ai'],
    }),
    nodes: [],
    edges: [],
    triggers: [{ type: 'event', config: { event: 'ticket.created' } }],
    variables: {},
  },
  {
    ...createBaseItem('Daily Report Generator', 'daily-report', 'workflows', {
      description: 'Automatically generate and send daily reports from multiple data sources',
      installCount: 8500,
      rating: 4.4,
      tags: ['reports', 'automation', 'scheduled', 'data'],
    }),
    nodes: [],
    edges: [],
    triggers: [{ type: 'schedule', config: { cron: '0 9 * * *' } }],
    variables: {},
  },
];

// ==================== Sample Prompts ====================

const SAMPLE_PROMPTS: PromptTemplate[] = [
  {
    ...createBaseItem('Code Review Prompt', 'code-review', 'prompts', {
      description: 'Comprehensive code review prompt with security, performance, and best practices analysis',
      featured: true,
      installCount: 45000,
      rating: 4.9,
      tags: ['code-review', 'development', 'security', 'quality'],
    }),
    content: 'Review the following code for:\n1. Security vulnerabilities\n2. Performance issues\n3. Best practices\n4. Code style\n\nCode:\n```\n{code}\n```',
    variables: ['code'],
    examples: [
      { variables: { code: 'function add(a, b) { return a + b; }' }, output: 'This simple function is secure and performant...' },
    ],
    category_tags: ['development', 'review'],
  },
  {
    ...createBaseItem('Technical Documentation Generator', 'tech-docs', 'prompts', {
      description: 'Generate comprehensive technical documentation from code and comments',
      installCount: 28000,
      rating: 4.7,
      tags: ['documentation', 'technical', 'api-docs'],
    }),
    content: 'Generate technical documentation for:\n\n{content}',
    variables: ['content'],
    examples: [],
    category_tags: ['documentation'],
  },
  {
    ...createBaseItem('Creative Story Writer', 'story-writer', 'prompts', {
      description: 'Craft engaging stories with customizable genre, tone, and length',
      installCount: 22000,
      rating: 4.6,
      tags: ['creative', 'writing', 'storytelling', 'fiction'],
    }),
    content: 'Write a {genre} story about {topic} in {tone} tone. Length: {length} words.',
    variables: ['genre', 'topic', 'tone', 'length'],
    examples: [],
    category_tags: ['creative', 'writing'],
  },
];

// ==================== Sample Voices ====================

const SAMPLE_VOICES: VoicePack[] = [
  {
    ...createBaseItem('Professional Male Voice', 'professional-male', 'voices', {
      description: 'Clear, professional male voice perfect for business and educational content',
      featured: true,
      installCount: 35000,
      rating: 4.8,
      tags: ['male', 'professional', 'business', 'english'],
    }),
    provider: 'elevenlabs',
    voiceId: 'professional-male-v1',
    preview: 'https://example.com/preview.mp3',
    languages: ['en-US', 'en-GB'],
    gender: 'male',
    age: 'adult',
    style: ['professional', 'friendly', 'authoritative'],
  },
  {
    ...createBaseItem('Friendly Female Voice', 'friendly-female', 'voices', {
      description: 'Warm, friendly female voice ideal for assistants and customer service',
      installCount: 42000,
      rating: 4.9,
      tags: ['female', 'friendly', 'assistant', 'english'],
    }),
    provider: 'elevenlabs',
    voiceId: 'friendly-female-v1',
    languages: ['en-US'],
    gender: 'female',
    age: 'adult',
    style: ['friendly', 'warm', 'helpful'],
  },
  {
    ...createBaseItem('Deep Narrator Voice', 'deep-narrator', 'voices', {
      description: 'Deep, authoritative voice perfect for narration and presentations',
      installCount: 18500,
      rating: 4.6,
      tags: ['male', 'deep', 'narrator', 'presentation'],
    }),
    provider: 'openai_tts',
    voiceId: 'onyx',
    languages: ['en-US'],
    gender: 'male',
    age: 'senior',
    style: ['authoritative', 'narrative'],
  },
];

// ==================== Sample Integrations ====================

const SAMPLE_INTEGRATIONS: Integration[] = [
  {
    ...createBaseItem('Google Workspace', 'google-workspace', 'integrations', {
      description: 'Full integration with Google Drive, Docs, Sheets, and Calendar',
      featured: true,
      installCount: 52000,
      rating: 4.8,
      tags: ['google', 'drive', 'docs', 'sheets', 'calendar'],
    }),
    service: 'google',
    authType: 'oauth',
    scopes: ['drive.readonly', 'drive.file', 'calendar', 'docs'],
    setupSteps: [
      {
        order: 1,
        title: 'Connect Google Account',
        description: 'Authorize Z-Claw to access your Google Workspace',
        action: 'redirect',
        url: '/oauth/google',
      },
      {
        order: 2,
        title: 'Select Scopes',
        description: 'Choose which Google services to enable',
        action: 'input',
        fields: [
          { key: 'drive', label: 'Google Drive', type: 'select', required: true },
          { key: 'calendar', label: 'Google Calendar', type: 'select', required: false },
        ],
      },
    ],
    webhooks: [
      { event: 'file.created', description: 'When a new file is created' },
      { event: 'file.updated', description: 'When a file is modified' },
    ],
  },
  {
    ...createBaseItem('Microsoft 365', 'microsoft-365', 'integrations', {
      description: 'Integration with Microsoft Teams, Outlook, and OneDrive',
      installCount: 38000,
      rating: 4.6,
      tags: ['microsoft', 'teams', 'outlook', 'onedrive'],
    }),
    service: 'microsoft',
    authType: 'oauth',
    scopes: ['files.read', 'mail.read', 'teams'],
    setupSteps: [],
    webhooks: [],
  },
  {
    ...createBaseItem('Jira Integration', 'jira', 'integrations', {
      description: 'Connect with Jira for issue tracking and project management',
      installCount: 25000,
      rating: 4.5,
      tags: ['jira', 'issues', 'project-management', 'atlassian'],
    }),
    service: 'jira',
    authType: 'api_key',
    scopes: ['read:jira-work', 'write:jira-work'],
    setupSteps: [],
    webhooks: [],
  },
];

// ==================== Sample Themes ====================

const SAMPLE_THEMES: Theme[] = [
  {
    ...createBaseItem('Midnight Blue', 'midnight-blue', 'themes', {
      description: 'Elegant dark theme with deep blue accents, perfect for night coding',
      featured: true,
      installCount: 48000,
      rating: 4.9,
      tags: ['dark', 'blue', 'elegant', 'night'],
    }),
    type: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#0f172a',
      foreground: '#f1f5f9',
      muted: '#475569',
      border: '#334155',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
  },
  {
    ...createBaseItem('Sunset Orange', 'sunset-orange', 'themes', {
      description: 'Warm light theme with orange accents for a cozy feel',
      installCount: 32000,
      rating: 4.7,
      tags: ['light', 'orange', 'warm', 'cozy'],
    }),
    type: 'light',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fffbeb',
      foreground: '#1c1917',
      muted: '#a8a29e',
      border: '#e7e5e4',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'Fira Code',
    },
  },
  {
    ...createBaseItem('Cyberpunk Neon', 'cyberpunk-neon', 'themes', {
      description: 'Futuristic theme with neon colors and glowing effects',
      installCount: 28500,
      rating: 4.6,
      tags: ['dark', 'neon', 'cyberpunk', 'futuristic'],
    }),
    type: 'dark',
    colors: {
      primary: '#f0abfc',
      secondary: '#c026d3',
      accent: '#22d3ee',
      background: '#0c0a09',
      foreground: '#fafaf9',
      muted: '#78716c',
      border: '#44403c',
    },
    fonts: {
      heading: 'Orbitron',
      body: 'Roboto',
      mono: 'Fira Code',
    },
    customCss: '.glow { text-shadow: 0 0 10px currentColor; }',
  },
];

// ==================== Sample Collections ====================

const SAMPLE_COLLECTIONS: MarketplaceCollection[] = [
  {
    id: randomUUID(),
    name: 'Essential Developer Tools',
    slug: 'essential-dev-tools',
    description: 'Must-have tools for every developer using Z-Claw',
    curator: SAMPLE_AUTHORS[0],
    itemCount: 15,
    followers: 5200,
    items: [],
    tags: ['development', 'tools', 'essential'],
    featured: true,
    createdAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'AI Productivity Pack',
    slug: 'ai-productivity',
    description: 'Boost your productivity with these AI-powered tools',
    curator: SAMPLE_AUTHORS[1],
    itemCount: 12,
    followers: 3800,
    items: [],
    tags: ['ai', 'productivity', 'automation'],
    featured: true,
    createdAt: new Date(),
  },
];

// ==================== Marketplace Class ====================

export class UnifiedMarketplace {
  private items: Map<string, MarketplaceItem> = new Map();
  private installedItems: Map<string, MarketplaceItem> = new Map();
  private reviews: Map<string, MarketplaceReview[]> = new Map();

  constructor() {
    // Initialize with all sample data
    const allItems: MarketplaceItem[] = [
      ...SAMPLE_AGENTS,
      ...SAMPLE_PLUGINS,
      ...SAMPLE_TEMPLATES,
      ...SAMPLE_WORKFLOWS,
      ...SAMPLE_PROMPTS,
      ...SAMPLE_VOICES,
      ...SAMPLE_INTEGRATIONS,
      ...SAMPLE_THEMES,
    ];

    for (const item of allItems) {
      this.items.set(item.slug, item);
      if (item.installed) {
        this.installedItems.set(item.slug, item);
      }
    }
  }

  // Search marketplace
  async search(filters: MarketplaceSearchFilters): Promise<MarketplaceSearchResult> {
    let items = Array.from(this.items.values());

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.source) {
      items = items.filter((item) => item.source === filters.source);
    }

    if (filters.tags && filters.tags.length > 0) {
      items = items.filter((item) => filters.tags!.some((tag) => item.tags.includes(tag)));
    }

    if (filters.author) {
      items = items.filter((item) => item.author.username === filters.author);
    }

    if (filters.price && filters.price.length > 0) {
      items = items.filter((item) => filters.price!.includes(item.price));
    }

    if (filters.rating) {
      items = items.filter((item) => item.rating >= filters.rating!);
    }

    if (filters.installed !== undefined) {
      items = items.filter((item) => item.installed === filters.installed);
    }

    if (filters.featured) {
      items = items.filter((item) => item.featured);
    }

    if (filters.verified) {
      items = items.filter((item) => item.verified);
    }

    // Sort
    const sortBy = filters.sortBy || 'popular';
    const sortOrder = filters.sortOrder || 'desc';

    items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'popular':
          comparison = a.installCount - b.installCount;
          break;
        case 'recent':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'downloads':
          comparison = a.downloadCount - b.downloadCount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = items.length;
    const page = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
    const pageSize = filters.limit || 20;
    const offset = filters.offset || 0;
    const paginatedItems = items.slice(offset, offset + pageSize);

    // Aggregations
    const categoryAgg: Record<MarketplaceCategory, number> = {
      skills: 0,
      agents: 0,
      plugins: 0,
      templates: 0,
      providers: 0,
      themes: 0,
      workflows: 0,
      prompts: 0,
      voices: 0,
      integrations: 0,
    };

    const sourceAgg: Record<MarketplaceSource, number> = {
      clawdhub: 0,
      smithery: 0,
      npm: 0,
      github: 0,
      composio: 0,
      opentools: 0,
      mcp_hub: 0,
      local: 0,
    };

    const tagCounts: Map<string, number> = new Map();

    for (const item of items) {
      categoryAgg[item.category]++;
      sourceAgg[item.source]++;
      for (const tag of item.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
      aggregations: {
        categories: categoryAgg,
        sources: sourceAgg,
        tags: Array.from(tagCounts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
      },
    };
  }

  // Get item by slug
  getItem(slug: string): MarketplaceItem | undefined {
    return this.items.get(slug);
  }

  // Get items by category
  getByCategory(category: MarketplaceCategory): MarketplaceItem[] {
    return Array.from(this.items.values()).filter((item) => item.category === category);
  }

  // Get featured items
  getFeatured(limit: number = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .filter((item) => item.featured)
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit);
  }

  // Get trending items
  getTrending(limit: number = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit);
  }

  // Get new releases
  getNewReleases(limit: number = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Install item
  async install(slug: string): Promise<MarketplaceInstallResult> {
    const item = this.items.get(slug);
    if (!item) {
      return {
        success: false,
        error: `Item "${slug}" not found`,
      };
    }

    // Mark as installed
    item.installed = true;
    this.installedItems.set(slug, item);

    return {
      success: true,
      item,
      installPath: `~/.z-claw/installed/${item.category}/${slug}`,
      postInstallSteps: item.category === 'templates' ? ['Run template setup wizard'] : [],
    };
  }

  // Uninstall item
  async uninstall(slug: string): Promise<{ success: boolean; error?: string }> {
    const item = this.installedItems.get(slug);
    if (!item) {
      return {
        success: false,
        error: `Item "${slug}" is not installed`,
      };
    }

    item.installed = false;
    this.installedItems.delete(slug);

    return { success: true };
  }

  // Get installed items
  getInstalled(): MarketplaceItem[] {
    return Array.from(this.installedItems.values());
  }

  // Get reviews for item
  getReviews(slug: string): MarketplaceReview[] {
    return this.reviews.get(slug) || [];
  }

  // Add review
  addReview(slug: string, review: Omit<MarketplaceReview, 'id' | 'createdAt'>): MarketplaceReview {
    const newReview: MarketplaceReview = {
      ...review,
      id: randomUUID(),
      createdAt: new Date(),
    };

    const itemReviews = this.reviews.get(slug) || [];
    itemReviews.push(newReview);
    this.reviews.set(slug, itemReviews);

    return newReview;
  }

  // Get collections
  getCollections(): MarketplaceCollection[] {
    return SAMPLE_COLLECTIONS;
  }

  // Get stats
  getStats(): MarketplaceStats {
    const items = Array.from(this.items.values());
    const categoryCounts: Record<MarketplaceCategory, number> = {
      skills: 0,
      agents: 0,
      plugins: 0,
      templates: 0,
      providers: 0,
      themes: 0,
      workflows: 0,
      prompts: 0,
      voices: 0,
      integrations: 0,
    };

    for (const item of items) {
      categoryCounts[item.category]++;
    }

    return {
      totalItems: items.length,
      totalDownloads: items.reduce((sum, item) => sum + item.downloadCount, 0),
      totalReviews: items.reduce((sum, item) => sum + item.reviewCount, 0),
      categories: categoryCounts,
      trending: this.getTrending(5),
      featured: this.getFeatured(5),
      newReleases: this.getNewReleases(5),
      topAuthors: SAMPLE_AUTHORS,
    };
  }

  // Get agents
  getAgents(): AgentTemplate[] {
    return SAMPLE_AGENTS;
  }

  // Get plugins
  getPlugins(): Plugin[] {
    return SAMPLE_PLUGINS;
  }

  // Get templates
  getTemplates(): Template[] {
    return SAMPLE_TEMPLATES;
  }

  // Get workflows
  getWorkflows(): Workflow[] {
    return SAMPLE_WORKFLOWS;
  }

  // Get prompts
  getPrompts(): PromptTemplate[] {
    return SAMPLE_PROMPTS;
  }

  // Get voices
  getVoices(): VoicePack[] {
    return SAMPLE_VOICES;
  }

  // Get integrations
  getIntegrations(): Integration[] {
    return SAMPLE_INTEGRATIONS;
  }

  // Get themes
  getThemes(): Theme[] {
    return SAMPLE_THEMES;
  }
}

// Singleton instance
let marketplaceInstance: UnifiedMarketplace | null = null;

export function getUnifiedMarketplace(): UnifiedMarketplace {
  if (!marketplaceInstance) {
    marketplaceInstance = new UnifiedMarketplace();
  }
  return marketplaceInstance;
}

// Export sample data for external use
export {
  SAMPLE_AGENTS,
  SAMPLE_PLUGINS,
  SAMPLE_TEMPLATES,
  SAMPLE_WORKFLOWS,
  SAMPLE_PROMPTS,
  SAMPLE_VOICES,
  SAMPLE_INTEGRATIONS,
  SAMPLE_THEMES,
  SAMPLE_COLLECTIONS,
  SAMPLE_AUTHORS,
};
