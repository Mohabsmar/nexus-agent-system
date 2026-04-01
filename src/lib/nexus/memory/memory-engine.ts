// NEXUS Multi-Tier Memory Engine
// 5-tier memory system with semantic search and persistence

import {
  WorkingMemory,
  EpisodicMemory,
  SemanticMemory,
  ProceduralMemory,
  UserPreference,
} from './types';
import { randomUUID } from 'crypto';

// Memory storage (in production, this would use SQLite + Vector DB)
class MemoryStorage {
  private episodic: Map<string, EpisodicMemory> = new Map();
  private semantic: Map<string, SemanticMemory> = new Map();
  private procedural: Map<string, ProceduralMemory> = new Map();
  private preferences: Map<string, UserPreference> = new Map();

  // Episodic Memory Operations
  addEpisodic(memory: EpisodicMemory): void {
    this.episodic.set(memory.id, memory);
  }

  getEpisodic(id: string): EpisodicMemory | undefined {
    return this.episodic.get(id);
  }

  listEpisodic(limit = 50): EpisodicMemory[] {
    return Array.from(this.episodic.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  searchEpisodic(query: string): EpisodicMemory[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.episodic.values())
      .filter(m => 
        m.summary.toLowerCase().includes(lowerQuery) ||
        m.keyFacts.some(f => f.toLowerCase().includes(lowerQuery)) ||
        m.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Semantic Memory Operations
  addSemantic(memory: SemanticMemory): void {
    this.semantic.set(memory.id, memory);
  }

  getSemantic(id: string): SemanticMemory | undefined {
    return this.semantic.get(id);
  }

  searchSemantic(query: string, limit = 5): SemanticMemory[] {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.semantic.values())
      .filter(m => 
        m.content.toLowerCase().includes(lowerQuery) ||
        m.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    
    // Sort by access count and recency
    results.sort((a, b) => {
      const scoreA = a.metadata.accessCount * 0.3 + (Date.now() - a.metadata.createdAt.getTime()) * -0.00001;
      const scoreB = b.metadata.accessCount * 0.3 + (Date.now() - b.metadata.createdAt.getTime()) * -0.00001;
      return scoreB - scoreA;
    });
    
    return results.slice(0, limit);
  }

  // Procedural Memory Operations
  addProcedural(memory: ProceduralMemory): void {
    this.procedural.set(memory.id, memory);
  }

  getProcedural(skillName: string): ProceduralMemory | undefined {
    return Array.from(this.procedural.values())
      .find(m => m.skillName === skillName);
  }

  listProcedural(): ProceduralMemory[] {
    return Array.from(this.procedural.values())
      .sort((a, b) => b.successRate - a.successRate);
  }

  // User Preferences Operations
  setPreference(preference: UserPreference): void {
    this.preferences.set(preference.key, preference);
  }

  getPreference(key: string): UserPreference | undefined {
    return this.preferences.get(key);
  }

  getAllPreferences(): UserPreference[] {
    return Array.from(this.preferences.values());
  }

  // Stats
  getStats(): { episodic: number; semantic: number; procedural: number; preferences: number } {
    return {
      episodic: this.episodic.size,
      semantic: this.semantic.size,
      procedural: this.procedural.size,
      preferences: this.preferences.size,
    };
  }

  // Export all memory
  exportAll(): {
    episodic: EpisodicMemory[];
    semantic: SemanticMemory[];
    procedural: ProceduralMemory[];
    preferences: UserPreference[];
  } {
    return {
      episodic: Array.from(this.episodic.values()),
      semantic: Array.from(this.semantic.values()),
      procedural: Array.from(this.procedural.values()),
      preferences: Array.from(this.preferences.values()),
    };
  }
}

export class MemoryEngine {
  private workingMemory: WorkingMemory = {
    context: [],
    maxItems: 50,
  };
  private storage = new MemoryStorage();

  // Tier 1: Working Memory (in-context)
  addToWorkingMemory(item: string): void {
    if (this.workingMemory.context.length >= this.workingMemory.maxItems) {
      // Remove oldest item
      this.workingMemory.context.shift();
    }
    this.workingMemory.context.push(item);
  }

  getWorkingMemory(): string[] {
    return [...this.workingMemory.context];
  }

  clearWorkingMemory(): void {
    this.workingMemory.context = [];
  }

  // Tier 2: Episodic Memory (session summaries)
  saveEpisode(session: {
    sessionId: string;
    summary: string;
    keyFacts: string[];
    outcome: 'success' | 'failure' | 'partial';
    tags: string[];
    toolsUsed: string[];
    modelUsed: string;
    cost: number;
    duration: number;
  }): EpisodicMemory {
    const memory: EpisodicMemory = {
      id: randomUUID(),
      ...session,
      timestamp: new Date(),
    };
    this.storage.addEpisodic(memory);
    return memory;
  }

  getEpisode(id: string): EpisodicMemory | undefined {
    return this.storage.getEpisodic(id);
  }

  listEpisodes(limit?: number): EpisodicMemory[] {
    return this.storage.listEpisodic(limit);
  }

  searchEpisodes(query: string): EpisodicMemory[] {
    return this.storage.searchEpisodic(query);
  }

  // Tier 3: Semantic Memory (knowledge store)
  addKnowledge(
    content: string,
    metadata: { source: string; type: 'code' | 'knowledge' | 'solution' | 'document' },
    tags: string[] = []
  ): SemanticMemory {
    const memory: SemanticMemory = {
      id: randomUUID(),
      content,
      metadata: {
        ...metadata,
        createdAt: new Date(),
        accessCount: 0,
      },
      tags,
    };
    this.storage.addSemantic(memory);
    return memory;
  }

  searchKnowledge(query: string, limit?: number): SemanticMemory[] {
    const results = this.storage.searchSemantic(query, limit);
    // Increment access count
    for (const memory of results) {
      memory.metadata.accessCount++;
    }
    return results;
  }

  // Tier 4: Procedural Memory (skills/workflows)
  saveProcedure(
    skillName: string,
    description: string,
    steps: string[],
    examples: string[] = []
  ): ProceduralMemory {
    const existing = this.storage.getProcedural(skillName);
    if (existing) {
      existing.steps = steps;
      existing.examples = examples;
      existing.lastUpdated = new Date();
      return existing;
    }
    
    const memory: ProceduralMemory = {
      id: randomUUID(),
      skillName,
      description,
      steps,
      examples,
      successRate: 1.0,
      lastUpdated: new Date(),
    };
    this.storage.addProcedural(memory);
    return memory;
  }

  getProcedure(skillName: string): ProceduralMemory | undefined {
    return this.storage.getProcedural(skillName);
  }

  listProcedures(): ProceduralMemory[] {
    return this.storage.listProcedural();
  }

  updateProcedureSuccess(skillName: string, success: boolean): void {
    const proc = this.storage.getProcedural(skillName);
    if (proc) {
      // Simple moving average
      proc.successRate = proc.successRate * 0.9 + (success ? 1 : 0) * 0.1;
    }
  }

  // Tier 5: User Preferences
  setPreference(key: string, value: unknown, category: UserPreference['category']): void {
    const preference: UserPreference = {
      key,
      value,
      category,
      updatedAt: new Date(),
    };
    this.storage.setPreference(preference);
  }

  getPreference(key: string): unknown {
    return this.storage.getPreference(key)?.value;
  }

  getAllPreferences(): UserPreference[] {
    return this.storage.getAllPreferences();
  }

  // Memory extraction from session
  extractFromSession(session: {
    goal: string;
    result: unknown;
    toolsUsed: string[];
    errors: string[];
    duration: number;
    cost: number;
    model: string;
  }): void {
    // Extract key facts from the session
    const keyFacts: string[] = [];
    if (session.errors.length > 0) {
      keyFacts.push(`Errors encountered: ${session.errors.join(', ')}`);
    }
    if (session.toolsUsed.length > 0) {
      keyFacts.push(`Tools used: ${session.toolsUsed.join(', ')}`);
    }

    // Save to episodic memory
    this.saveEpisode({
      sessionId: randomUUID(),
      summary: session.goal,
      keyFacts,
      outcome: session.errors.length === 0 ? 'success' : 'partial',
      tags: this.extractTags(session.goal),
      toolsUsed: session.toolsUsed,
      modelUsed: session.model,
      cost: session.cost,
      duration: session.duration,
    });

    // Add important context to working memory
    this.addToWorkingMemory(`Session: ${session.goal} - ${session.errors.length === 0 ? 'Success' : 'Partial'}`);
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const keywords = ['api', 'code', 'data', 'web', 'file', 'test', 'build', 'deploy'];
    for (const kw of keywords) {
      if (text.toLowerCase().includes(kw)) {
        tags.push(kw);
      }
    }
    return tags;
  }

  // Get relevant context for a task
  getRelevantContext(taskDescription: string, maxItems = 5): string[] {
    const context: string[] = [];

    // Get from working memory
    context.push(...this.getWorkingMemory().slice(-maxItems));

    // Get from semantic memory
    const knowledge = this.searchKnowledge(taskDescription, maxItems);
    context.push(...knowledge.map(k => k.content));

    // Get from episodic memory
    const episodes = this.searchEpisodes(taskDescription).slice(0, 2);
    context.push(...episodes.map(e => e.summary));

    return context;
  }

  // Stats
  getStats(): ReturnType<MemoryStorage['getStats']> {
    return this.storage.getStats();
  }

  // Export
  exportAll(): ReturnType<MemoryStorage['exportAll']> {
    return this.storage.exportAll();
  }

  // Clear all memory (for testing/reset)
  clearAll(): void {
    this.workingMemory.context = [];
    this.storage = new MemoryStorage();
  }
}

// Singleton instance
let memoryInstance: MemoryEngine | null = null;

export function getMemory(): MemoryEngine {
  if (!memoryInstance) {
    memoryInstance = new MemoryEngine();
  }
  return memoryInstance;
}
