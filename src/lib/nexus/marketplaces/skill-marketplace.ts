// NEXUS Skill Marketplace Integration
// Unified access to ClawdHub, Smithery, npm, GitHub, and more

import { Skill, SkillSearchResult, MarketplaceSource } from './types';
import { randomUUID } from 'crypto';

// Marketplace configurations
const MARKETPLACES: Record<MarketplaceSource, {
  name: string;
  url: string;
  skillCount: number;
  format: string;
  specialty?: string;
}> = {
  clawdhub: {
    name: 'ClawdHub',
    url: 'https://clawdhub.com',
    skillCount: 39000,
    format: 'SKILL.md with YAML frontmatter',
  },
  smithery: {
    name: 'Smithery',
    url: 'https://smithery.ai',
    skillCount: 5000,
    format: 'MCP servers',
    specialty: 'MCP (Model Context Protocol) server hosting',
  },
  npm: {
    name: 'npm Registry',
    url: 'https://registry.npmjs.org',
    skillCount: 1000,
    format: 'package.json with nexus-skill keyword',
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com',
    skillCount: 500,
    format: 'SKILL.md in repo root',
  },
  composio: {
    name: 'Composio',
    url: 'https://composio.dev',
    skillCount: 250,
    format: 'Pre-authenticated integrations',
    specialty: 'App integrations (Gmail, Slack, Notion, etc.)',
  },
  opentools: {
    name: 'OpenTools',
    url: 'https://opentools.ai',
    skillCount: 300,
    format: 'Tool definitions',
    specialty: 'Pre-built API tool integrations',
  },
  mcp_hub: {
    name: 'MCPHub',
    url: 'https://mcphub.com',
    skillCount: 200,
    format: 'MCP server configurations',
    specialty: 'Community MCP server directory',
  },
  local: {
    name: 'Local Skills',
    url: '',
    skillCount: 0,
    format: 'SKILL.md files',
  },
};

// Sample skills for demonstration
const SAMPLE_SKILLS: Skill[] = [
  {
    id: randomUUID(),
    name: 'Web Scraper Pro',
    slug: 'web-scraper-pro',
    description: 'Advanced web scraping with JavaScript rendering, pagination support, and data extraction',
    source: 'clawdhub',
    version: '2.1.0',
    author: 'nexus-team',
    rating: 4.8,
    installCount: 15420,
    installed: false,
    capabilities: ['scraping', 'javascript-rendering', 'pagination', 'data-extraction'],
    dependencies: ['playwright'],
  },
  {
    id: randomUUID(),
    name: 'Code Review Assistant',
    slug: 'code-review-assistant',
    description: 'AI-powered code review with best practices, security checks, and performance analysis',
    source: 'smithery',
    version: '1.5.0',
    author: 'dev-tools',
    rating: 4.9,
    installCount: 8750,
    installed: true,
    capabilities: ['code-review', 'security-scan', 'performance-analysis', 'best-practices'],
    dependencies: ['tree-sitter'],
  },
  {
    id: randomUUID(),
    name: 'API Documentation Generator',
    slug: 'api-doc-generator',
    description: 'Automatically generate API documentation from code with OpenAPI/Swagger support',
    source: 'npm',
    version: '3.0.0',
    author: 'api-tools',
    rating: 4.6,
    installCount: 12300,
    installed: false,
    capabilities: ['documentation', 'openapi', 'swagger', 'typescript'],
    dependencies: [],
  },
  {
    id: randomUUID(),
    name: 'Database Migrator',
    slug: 'db-migrator',
    description: 'Safe database migrations with rollback support for PostgreSQL, MySQL, and SQLite',
    source: 'github',
    version: '1.2.0',
    author: 'db-tools',
    rating: 4.7,
    installCount: 5600,
    installed: true,
    capabilities: ['migrations', 'rollback', 'postgresql', 'mysql', 'sqlite'],
    dependencies: ['pg', 'mysql2'],
  },
  {
    id: randomUUID(),
    name: 'Slack Integration',
    slug: 'slack-integration',
    description: 'Send messages, search channels, and manage Slack workspace through NEXUS',
    source: 'composio',
    version: '1.0.0',
    author: 'composio',
    rating: 4.5,
    installCount: 3200,
    installed: false,
    capabilities: ['slack', 'messaging', 'channels', 'search'],
    dependencies: [],
  },
  {
    id: randomUUID(),
    name: 'GitHub Actions Manager',
    slug: 'github-actions-manager',
    description: 'Create, update, and manage GitHub Actions workflows programmatically',
    source: 'clawdhub',
    version: '2.0.0',
    author: 'ci-cd-tools',
    rating: 4.4,
    installCount: 7800,
    installed: false,
    capabilities: ['github-actions', 'ci-cd', 'workflows', 'automation'],
    dependencies: ['@octokit/rest'],
  },
];

// Resolution order for finding skills
const RESOLUTION_ORDER: MarketplaceSource[] = [
  'local',
  'clawdhub',
  'smithery',
  'composio',
  'npm',
  'github',
  'opentools',
  'mcp_hub',
];

export class SkillMarketplace {
  private installedSkills: Map<string, Skill> = new Map();
  private localSkills: Map<string, Skill> = new Map();

  constructor() {
    // Load installed skills
    for (const skill of SAMPLE_SKILLS.filter(s => s.installed)) {
      this.installedSkills.set(skill.slug, skill);
    }
  }

  // Search for skills across all marketplaces
  async search(query: string, options?: {
    sources?: MarketplaceSource[];
    limit?: number;
  }): Promise<SkillSearchResult[]> {
    const sources = options?.sources || RESOLUTION_ORDER;
    const limit = options?.limit || 10;
    const results: SkillSearchResult[] = [];

    // Search in sample skills (in production, would call actual APIs)
    const lowerQuery = query.toLowerCase();
    
    for (const skill of SAMPLE_SKILLS) {
      if (sources.includes(skill.source)) {
        const relevanceScore = this.calculateRelevance(skill, lowerQuery);
        if (relevanceScore > 0) {
          results.push({
            skill,
            relevanceScore,
            installSize: '2.5 MB', // Placeholder
          });
        }
      }
    }

    // Sort by relevance, then by rating
    results.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.skill.rating - a.skill.rating;
    });

    return results.slice(0, limit);
  }

  // Calculate relevance score for a skill
  private calculateRelevance(skill: Skill, query: string): number {
    let score = 0;
    
    // Check name
    if (skill.name.toLowerCase().includes(query)) {
      score += 0.5;
    }
    
    // Check description
    if (skill.description.toLowerCase().includes(query)) {
      score += 0.3;
    }
    
    // Check capabilities
    for (const cap of skill.capabilities) {
      if (cap.toLowerCase().includes(query)) {
        score += 0.2;
        break;
      }
    }
    
    // Check tags
    const tags = [...skill.capabilities, skill.source];
    for (const tag of tags) {
      if (tag.toLowerCase().includes(query)) {
        score += 0.1;
        break;
      }
    }
    
    return score;
  }

  // Install a skill
  async install(slug: string, source?: MarketplaceSource): Promise<Skill> {
    // Find the skill
    let skill = SAMPLE_SKILLS.find(s => s.slug === slug);
    
    if (!skill) {
      // In production, would search actual marketplaces
      // For now, create a placeholder
      skill = {
        id: randomUUID(),
        name: slug,
        slug,
        description: `Skill installed from ${source || 'marketplace'}`,
        source: source || 'clawdhub',
        version: '1.0.0',
        author: 'unknown',
        rating: 0,
        installCount: 0,
        installed: true,
        capabilities: [],
        dependencies: [],
      };
    }

    // Mark as installed
    skill = { ...skill, installed: true };
    this.installedSkills.set(slug, skill);
    
    return skill;
  }

  // Uninstall a skill
  async uninstall(slug: string): Promise<boolean> {
    return this.installedSkills.delete(slug);
  }

  // Get installed skills
  getInstalled(): Skill[] {
    return Array.from(this.installedSkills.values());
  }

  // Get a specific skill
  getSkill(slug: string): Skill | undefined {
    return this.installedSkills.get(slug) || SAMPLE_SKILLS.find(s => s.slug === slug);
  }

  // Get skill by capability
  getByCapability(capability: string): Skill[] {
    const results: Skill[] = [];
    
    for (const skill of this.installedSkills.values()) {
      if (skill.capabilities.includes(capability)) {
        results.push(skill);
      }
    }
    
    return results;
  }

  // Update all installed skills
  async updateAll(): Promise<{ updated: string[]; errors: string[] }> {
    const updated: string[] = [];
    const errors: string[] = [];

    for (const [slug] of this.installedSkills) {
      try {
        // In production, would check for updates
        updated.push(slug);
      } catch {
        errors.push(slug);
      }
    }

    return { updated, errors };
  }

  // Create a new skill
  create(skill: Omit<Skill, 'id' | 'installed'>): Skill {
    const newSkill: Skill = {
      ...skill,
      id: randomUUID(),
      installed: true,
      source: 'local',
    };
    
    this.localSkills.set(skill.slug, newSkill);
    this.installedSkills.set(skill.slug, newSkill);
    
    return newSkill;
  }

  // Get marketplace info
  getMarketplaces(): Array<{ source: MarketplaceSource; info: typeof MARKETPLACES[MarketplaceSource] }> {
    return Object.entries(MARKETPLACES).map(([source, info]) => ({
      source: source as MarketplaceSource,
      info,
    }));
  }

  // Get stats
  getStats(): { installed: number; total: number } {
    return {
      installed: this.installedSkills.size,
      total: SAMPLE_SKILLS.length,
    };
  }
}

// Singleton instance
let marketplaceInstance: SkillMarketplace | null = null;

export function getMarketplace(): SkillMarketplace {
  if (!marketplaceInstance) {
    marketplaceInstance = new SkillMarketplace();
  }
  return marketplaceInstance;
}

export { MARKETPLACES, RESOLUTION_ORDER, SAMPLE_SKILLS };
