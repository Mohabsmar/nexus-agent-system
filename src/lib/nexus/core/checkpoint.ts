// NEXUS Checkpoint & Rollback System
// State snapshots for safe operation recovery

import { Checkpoint } from './types';
import { randomUUID } from 'crypto';

// Maximum checkpoints to keep
const MAX_CHECKPOINTS = 50;

export class CheckpointManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private currentSessionId: string | null = null;

  // Create a new checkpoint
  create(description: string, snapshot: {
    files?: Record<string, string>;
    memory?: string[];
    taskState?: string;
  }): Checkpoint {
    const checkpoint: Checkpoint = {
      id: randomUUID(),
      timestamp: new Date(),
      description,
      snapshot: {
        files: snapshot.files || {},
        memory: snapshot.memory || [],
        taskState: snapshot.taskState || '',
      },
      canRollback: true,
    };

    this.checkpoints.set(checkpoint.id, checkpoint);

    // Prune old checkpoints if over limit
    this.pruneCheckpoints();

    return checkpoint;
  }

  // Get checkpoint by ID
  get(id: string): Checkpoint | undefined {
    return this.checkpoints.get(id);
  }

  // List all checkpoints
  list(limit = 20): Checkpoint[] {
    return Array.from(this.checkpoints.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Rollback to a checkpoint
  async rollback(id: string): Promise<{ success: boolean; checkpoint?: Checkpoint; error?: string }> {
    const checkpoint = this.checkpoints.get(id);
    
    if (!checkpoint) {
      return { success: false, error: 'Checkpoint not found' };
    }
    
    if (!checkpoint.canRollback) {
      return { success: false, error: 'Checkpoint is not rollbackable' };
    }

    // In production, this would:
    // 1. Restore files from snapshot
    // 2. Restore memory state
    // 3. Restore task state
    
    return { success: true, checkpoint };
  }

  // Rollback to last checkpoint
  async rollbackLast(): Promise<{ success: boolean; checkpoint?: Checkpoint; error?: string }> {
    const checkpoints = this.list(1);
    if (checkpoints.length === 0) {
      return { success: false, error: 'No checkpoints available' };
    }
    return this.rollback(checkpoints[0].id);
  }

  // Delete a checkpoint
  delete(id: string): boolean {
    return this.checkpoints.delete(id);
  }

  // Clear all checkpoints
  clear(): void {
    this.checkpoints.clear();
  }

  // Prune old checkpoints
  private pruneCheckpoints(): void {
    if (this.checkpoints.size <= MAX_CHECKPOINTS) {
      return;
    }

    const sorted = Array.from(this.checkpoints.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Keep only the most recent
    const toKeep = new Set(sorted.slice(0, MAX_CHECKPOINTS).map(c => c.id));
    
    for (const [id] of this.checkpoints) {
      if (!toKeep.has(id)) {
        this.checkpoints.delete(id);
      }
    }
  }

  // Set current session
  setSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  // Get session checkpoints
  getSessionCheckpoints(): Checkpoint[] {
    // In production, would filter by session
    return this.list();
  }

  // Get stats
  getStats(): { total: number; oldest?: Date; newest?: Date } {
    const checkpoints = Array.from(this.checkpoints.values());
    
    if (checkpoints.length === 0) {
      return { total: 0 };
    }
    
    const sorted = checkpoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      total: checkpoints.length,
      oldest: sorted[0].timestamp,
      newest: sorted[sorted.length - 1].timestamp,
    };
  }

  // Create file snapshot helper
  createFileSnapshot(files: Map<string, string>): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const [path, content] of files) {
      snapshot[path] = content;
    }
    return snapshot;
  }
}

// Singleton instance
let checkpointInstance: CheckpointManager | null = null;

export function getCheckpointManager(): CheckpointManager {
  if (!checkpointInstance) {
    checkpointInstance = new CheckpointManager();
  }
  return checkpointInstance;
}
