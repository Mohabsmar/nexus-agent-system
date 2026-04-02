// Z-Claw Agent - Main Orchestrator
// Ties all components together into a unified agent system

import { LLMRouter, getRouter } from './core/router';
import { TaskPlanner, getPlanner } from './planner/dag-planner';
import { MemoryEngine, getMemory } from './memory/memory-engine';
import { ToolRegistry, getToolRegistry } from './tools/tool-registry';
import { VoiceLayer, getVoiceLayer } from './voice/voice-layer';
import { SkillMarketplace, getMarketplace } from './marketplaces/skill-marketplace';
import { SecurityManager, getSecurityManager } from './security/security-manager';
import { EvaluationEngine, getEvaluator } from './core/evaluation';
import { CheckpointManager, getCheckpointManager } from './core/checkpoint';
import {
  Session,
  RunRequest,
  RunResponse,
  TaskStatus,
  DAG,
  ProviderName,
  Checkpoint,
  DashboardStats,
} from './types';
import { randomUUID } from 'crypto';

export class ZClawAgent {
  private router: LLMRouter;
  private planner: TaskPlanner;
  private memory: MemoryEngine;
  private tools: ToolRegistry;
  private voice: VoiceLayer;
  private marketplace: SkillMarketplace;
  private security: SecurityManager;
  private evaluator: EvaluationEngine;
  private checkpoints: CheckpointManager;
  
  private currentSession: Session | null = null;
  private sessions: Map<string, Session> = new Map();

  constructor() {
    this.router = getRouter();
    this.planner = getPlanner();
    this.memory = getMemory();
    this.tools = getToolRegistry();
    this.voice = getVoiceLayer();
    this.marketplace = getMarketplace();
    this.security = getSecurityManager();
    this.evaluator = getEvaluator();
    this.checkpoints = getCheckpointManager();
  }

  // Main entry point - run a task
  async run(request: RunRequest): Promise<RunResponse> {
    const sessionId = randomUUID();
    const startTime = Date.now();

    // Create session
    this.currentSession = {
      id: sessionId,
      startedAt: new Date(),
      goal: request.goal,
      status: 'running',
      tokensUsed: 0,
      cost: 0,
      provider: request.provider || 'anthropic',
      model: request.model || 'claude-sonnet-4-6',
      checkpoints: [],
      toolsCalled: [],
      memoryAccessed: [],
    };
    this.sessions.set(sessionId, this.currentSession);

    try {
      // Voice announcement
      if (request.voice && this.voice.isActive()) {
        await this.voice.speak('Starting task: ' + request.goal.slice(0, 50));
        await this.voice.playAlert('task_started');
      }

      // Check memory for relevant context
      if (!request.noMemory) {
        const context = this.memory.getRelevantContext(request.goal);
        this.currentSession.memoryAccessed = context;
      }

      // Build execution plan (DAG)
      let dag: DAG | null = null;
      if (!request.noPlan) {
        dag = this.planner.plan(request.goal);
        this.currentSession.dag = dag;
        
        // Create checkpoint before execution
        const checkpoint = this.checkpoints.create('Pre-execution snapshot', {
          taskState: JSON.stringify(dag),
        });
        this.currentSession.checkpoints.push(checkpoint);
      }

      // Execute the plan
      const result = await this.executePlan(dag, request);

      // Evaluate execution
      const evaluation = this.evaluator.evaluate({
        goal: request.goal,
        completed: result.success,
        tokensUsed: this.currentSession.tokensUsed,
        cost: this.currentSession.cost,
        duration: Date.now() - startTime,
        toolsUsed: this.currentSession.toolsCalled.map(t => t.tool),
        toolsFailed: this.currentSession.toolsCalled.filter(t => t.status === 'failed').map(t => t.tool),
        errors: result.error ? [result.error] : [],
        memoryHits: this.currentSession.memoryAccessed.length,
        memoryMisses: 0,
        voiceUsed: request.voice || false,
      });
      this.currentSession.evaluation = evaluation;

      // Save to memory
      if (!request.noMemory) {
        this.memory.extractFromSession({
          goal: request.goal,
          result: result.output,
          toolsUsed: this.currentSession.toolsCalled.map(t => t.tool),
          errors: result.error ? [result.error] : [],
          duration: Date.now() - startTime,
          cost: this.currentSession.cost,
          model: this.currentSession.model,
        });
      }

      // Voice completion
      if (request.voice && this.voice.isActive()) {
        await this.voice.playAlert('task_completed');
        await this.voice.speak(result.success ? 'Task completed successfully!' : 'Task encountered issues');
      }

      this.currentSession.status = result.success ? 'completed' : 'failed';
      this.currentSession.endedAt = new Date();

      return {
        sessionId,
        status: this.currentSession.status,
        result: result.output,
        error: result.error,
        metrics: {
          tokensUsed: this.currentSession.tokensUsed,
          cost: this.currentSession.cost,
          duration: Date.now() - startTime,
          toolsUsed: this.currentSession.toolsCalled.length,
        },
      };
    } catch (error) {
      this.currentSession.status = 'failed';
      this.currentSession.endedAt = new Date();
      
      return {
        sessionId,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          tokensUsed: this.currentSession.tokensUsed,
          cost: this.currentSession.cost,
          duration: Date.now() - startTime,
          toolsUsed: this.currentSession.toolsCalled.length,
        },
      };
    }
  }

  // Execute the DAG plan
  private async executePlan(dag: DAG | null, request: RunRequest): Promise<{ success: boolean; output?: unknown; error?: string }> {
    if (!dag) {
      // No plan - direct execution
      return this.executeDirect(request.goal);
    }

    try {
      const results = await this.planner.execute(dag, async (node) => {
        // Create tool call record
        const toolCall = this.tools.createToolCall(node.type, { description: node.description });
        this.currentSession?.toolsCalled.push(toolCall);

        // Get routing decision
        const routing = this.router.route(node.type, {
          latencyBudget: request.timeout ? request.timeout / dag.nodes.size : undefined,
        });

        // Update session stats
        if (this.currentSession) {
          this.currentSession.provider = routing.provider;
          this.currentSession.model = routing.model;
        }

        // Execute the node
        const result = await this.executeNode(node, routing);

        // Update tool call
        this.tools.updateToolCallStatus(
          toolCall.id,
          result.success ? 'success' : 'failed',
          result.output,
          result.error
        );

        // Track tokens
        if (this.currentSession) {
          this.currentSession.tokensUsed += result.tokensUsed;
          this.currentSession.cost += result.cost;
        }

        return result;
      });

      const allSuccess = Array.from(results.values()).every(r => r.success);
      const output = Array.from(results.values()).map(r => r.output);

      return {
        success: allSuccess,
        output: allSuccess ? output : undefined,
        error: allSuccess ? undefined : 'Some tasks failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Execute a single node
  private async executeNode(
    node: { type: string; description: string },
    routing: { provider: ProviderName; model: string }
  ): Promise<{ success: boolean; output?: unknown; error?: string; tokensUsed: number; cost: number; duration: number }> {
    const startTime = Date.now();
    
    // Simulate execution based on node type
    // In production, would call actual tools/APIs
    const tokensUsed = Math.floor(Math.random() * 1000) + 100;
    const cost = tokensUsed * 0.00001;
    
    // Simulate processing time
    await new Promise(r => setTimeout(r, Math.random() * 500 + 100));

    return {
      success: true,
      output: `Executed ${node.type}: ${node.description.slice(0, 50)}`,
      tokensUsed,
      cost,
      duration: Date.now() - startTime,
    };
  }

  // Direct execution without planning
  private async executeDirect(goal: string): Promise<{ success: boolean; output?: unknown; error?: string }> {
    const routing = this.router.route('reasoning');
    
    // Simulate direct execution
    await new Promise(r => setTimeout(r, 1000));
    
    const tokensUsed = Math.floor(Math.random() * 2000) + 500;
    const cost = tokensUsed * 0.00001;
    
    if (this.currentSession) {
      this.currentSession.tokensUsed += tokensUsed;
      this.currentSession.cost += cost;
    }

    return {
      success: true,
      output: `Completed: ${goal}`,
      tokensUsed,
      cost,
      duration: 1000,
    };
  }

  // Get session by ID
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all sessions
  getSessions(): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // Get dashboard statistics
  getStats(): DashboardStats {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter(s => s.status === 'completed').length;
    const memoryStats = this.memory.getStats();

    return {
      totalRuns: sessions.length,
      successRate: sessions.length > 0 ? (completed / sessions.length) * 100 : 0,
      totalTokens: sessions.reduce((sum, s) => sum + s.tokensUsed, 0),
      totalCost: sessions.reduce((sum, s) => sum + s.cost, 0),
      averageDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.endedAt?.getTime() || Date.now()) - s.startedAt.getTime(), 0) / sessions.length
        : 0,
      activeProviders: this.router.getProviders().filter(p => p.status === 'healthy').length,
      installedSkills: memoryStats.procedural,
      memoryEntries: memoryStats.episodic + memoryStats.semantic,
    };
  }

  // Component accessors
  getRouter(): LLMRouter { return this.router; }
  getPlanner(): TaskPlanner { return this.planner; }
  getMemory(): MemoryEngine { return this.memory; }
  getTools(): ToolRegistry { return this.tools; }
  getVoice(): VoiceLayer { return this.voice; }
  getMarketplace(): SkillMarketplace { return this.marketplace; }
  getSecurity(): SecurityManager { return this.security; }
  getEvaluator(): EvaluationEngine { return this.evaluator; }
  getCheckpoints(): CheckpointManager { return this.checkpoints; }
}

// Singleton instance
let agentInstance: ZClawAgent | null = null;

export function getAgent(): ZClawAgent {
  if (!agentInstance) {
    agentInstance = new ZClawAgent();
  }
  return agentInstance;
}

export default ZClawAgent;
