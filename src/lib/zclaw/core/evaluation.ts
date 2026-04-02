// Z-Claw Self-Improvement & Evaluation Loop
// Post-run evaluation and automatic improvement suggestions

import { EvaluationScore, ImprovementNote, Session } from './types';
import { randomUUID } from 'crypto';

// Evaluation weights
const EVALUATION_WEIGHTS = {
  taskCompletion: 0.35,
  efficiency: 0.20,
  toolSelection: 0.15,
  errorHandling: 0.15,
  memoryUtilization: 0.10,
  voiceQuality: 0.05,
};

// Improvement thresholds
const IMPROVEMENT_THRESHOLDS = {
  efficiency: 0.6,
  toolSelection: 0.7,
  memoryUtilization: 0.5,
};

export class EvaluationEngine {
  private evaluationHistory: Map<string, EvaluationScore> = new Map();
  private improvementNotes: ImprovementNote[] = [];

  // Evaluate a completed session
  evaluate(session: {
    goal: string;
    completed: boolean;
    tokensUsed: number;
    cost: number;
    duration: number;
    toolsUsed: string[];
    toolsFailed: string[];
    errors: string[];
    memoryHits: number;
    memoryMisses: number;
    voiceUsed: boolean;
    expectedTokens?: number;
  }): EvaluationScore {
    // Calculate individual scores
    const taskCompletion = session.completed ? 10 : (session.errors.length === 0 ? 5 : 0);
    
    const efficiency = this.calculateEfficiency(
      session.tokensUsed,
      session.expectedTokens || session.tokensUsed,
      session.cost,
      session.duration
    );
    
    const toolSelection = this.calculateToolSelection(
      session.toolsUsed,
      session.toolsFailed
    );
    
    const errorHandling = this.calculateErrorHandling(session.errors);
    
    const memoryUtilization = this.calculateMemoryUtilization(
      session.memoryHits,
      session.memoryMisses
    );
    
    const voiceQuality = session.voiceUsed ? 7 : 5; // Neutral if not used

    // Calculate weighted overall score
    const overall = 
      taskCompletion * EVALUATION_WEIGHTS.taskCompletion +
      efficiency * EVALUATION_WEIGHTS.efficiency +
      toolSelection * EVALUATION_WEIGHTS.toolSelection +
      errorHandling * EVALUATION_WEIGHTS.errorHandling +
      memoryUtilization * EVALUATION_WEIGHTS.memoryUtilization +
      voiceQuality * EVALUATION_WEIGHTS.voiceQuality;

    const score: EvaluationScore = {
      taskCompletion,
      efficiency,
      toolSelection,
      errorHandling,
      memoryUtilization,
      voiceQuality,
      overall,
    };

    // Store evaluation
    this.evaluationHistory.set(randomUUID(), score);

    // Generate improvement notes
    this.generateImprovements(score, session);

    return score;
  }

  private calculateEfficiency(
    tokensUsed: number,
    expectedTokens: number,
    cost: number,
    duration: number
  ): number {
    // Efficiency score based on token usage vs expected
    let score = 10;
    
    // Penalize for excessive tokens
    if (tokensUsed > expectedTokens * 1.5) {
      score -= 3;
    } else if (tokensUsed > expectedTokens * 1.2) {
      score -= 1;
    }
    
    // Penalize for high cost
    if (cost > 0.5) {
      score -= 2;
    } else if (cost > 0.1) {
      score -= 1;
    }
    
    // Penalize for long duration
    if (duration > 60000) { // > 1 minute
      score -= 2;
    } else if (duration > 30000) {
      score -= 1;
    }
    
    return Math.max(0, score);
  }

  private calculateToolSelection(toolsUsed: string[], toolsFailed: string[]): number {
    if (toolsUsed.length === 0) return 5;
    
    const failureRate = toolsFailed.length / toolsUsed.length;
    
    if (failureRate === 0) return 10;
    if (failureRate < 0.1) return 8;
    if (failureRate < 0.3) return 6;
    if (failureRate < 0.5) return 4;
    return 2;
  }

  private calculateErrorHandling(errors: string[]): number {
    if (errors.length === 0) return 10;
    if (errors.length === 1) return 8;
    if (errors.length < 3) return 6;
    if (errors.length < 5) return 4;
    return 2;
  }

  private calculateMemoryUtilization(hits: number, misses: number): number {
    if (hits === 0 && misses === 0) return 5; // Neutral
    
    const total = hits + misses;
    const hitRate = hits / total;
    
    if (hitRate >= 0.8) return 10;
    if (hitRate >= 0.6) return 8;
    if (hitRate >= 0.4) return 6;
    if (hitRate >= 0.2) return 4;
    return 2;
  }

  private generateImprovements(score: EvaluationScore, session: {
    goal: string;
    tokensUsed: number;
    cost: number;
    toolsUsed: string[];
    errors: string[];
  }): void {
    // Efficiency improvements
    if (score.efficiency < IMPROVEMENT_THRESHOLDS.efficiency * 10) {
      this.addImprovement({
        category: 'efficiency',
        description: `Efficiency score: ${score.efficiency.toFixed(1)}/10`,
        suggestion: 'Consider using cheaper models for classification tasks. Route simple tasks to Groq for 50x cost reduction.',
      });
    }

    // Tool selection improvements
    if (score.toolSelection < IMPROVEMENT_THRESHOLDS.toolSelection * 10) {
      this.addImprovement({
        category: 'tool_selection',
        description: `${session.toolsUsed.length} tools used, some failed`,
        suggestion: 'Review tool selection logic. Consider adding caching for repeated API calls.',
      });
    }

    // Memory improvements
    if (score.memoryUtilization < IMPROVEMENT_THRESHOLDS.memoryUtilization * 10) {
      this.addImprovement({
        category: 'memory',
        description: 'Low memory utilization detected',
        suggestion: 'Store key findings from this session. Consider adding project context to semantic memory.',
      });
    }

    // Cost improvements
    if (session.cost > 0.1) {
      this.addImprovement({
        category: 'cost',
        description: `Session cost: $${session.cost.toFixed(4)}`,
        suggestion: 'Route math/reasoning tasks to Groq (50x cheaper). Use Haiku for classification.',
      });
    }
  }

  private addImprovement(note: Omit<ImprovementNote, 'id' | 'createdAt' | 'applied'>): void {
    this.improvementNotes.push({
      id: randomUUID(),
      ...note,
      createdAt: new Date(),
      applied: false,
    });
  }

  // Get improvement notes
  getImprovements(options?: { category?: ImprovementNote['category']; unapplied?: boolean }): ImprovementNote[] {
    let notes = [...this.improvementNotes];
    
    if (options?.category) {
      notes = notes.filter(n => n.category === options.category);
    }
    
    if (options?.unapplied) {
      notes = notes.filter(n => !n.applied);
    }
    
    return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Mark improvement as applied
  applyImprovement(id: string): boolean {
    const note = this.improvementNotes.find(n => n.id === id);
    if (note) {
      note.applied = true;
      return true;
    }
    return false;
  }

  // Get evaluation history
  getHistory(limit = 10): Array<{ id: string; score: EvaluationScore }> {
    return Array.from(this.evaluationHistory.entries())
      .slice(-limit)
      .map(([id, score]) => ({ id, score }));
  }

  // Get average scores
  getAverages(): EvaluationScore {
    const scores = Array.from(this.evaluationHistory.values());
    
    if (scores.length === 0) {
      return {
        taskCompletion: 0,
        efficiency: 0,
        toolSelection: 0,
        errorHandling: 0,
        memoryUtilization: 0,
        voiceQuality: 0,
        overall: 0,
      };
    }
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    return {
      taskCompletion: avg(scores.map(s => s.taskCompletion)),
      efficiency: avg(scores.map(s => s.efficiency)),
      toolSelection: avg(scores.map(s => s.toolSelection)),
      errorHandling: avg(scores.map(s => s.errorHandling)),
      memoryUtilization: avg(scores.map(s => s.memoryUtilization)),
      voiceQuality: avg(scores.map(s => s.voiceQuality)),
      overall: avg(scores.map(s => s.overall)),
    };
  }

  // Get improvement stats
  getStats(): {
    totalEvaluations: number;
    averageOverall: number;
    totalImprovements: number;
    appliedImprovements: number;
  } {
    return {
      totalEvaluations: this.evaluationHistory.size,
      averageOverall: this.getAverages().overall,
      totalImprovements: this.improvementNotes.length,
      appliedImprovements: this.improvementNotes.filter(n => n.applied).length,
    };
  }
}

// Singleton instance
let evaluatorInstance: EvaluationEngine | null = null;

export function getEvaluator(): EvaluationEngine {
  if (!evaluatorInstance) {
    evaluatorInstance = new EvaluationEngine();
  }
  return evaluatorInstance;
}

export { EVALUATION_WEIGHTS };
