// Z-Claw DAG-Based Task Planner
// Builds Directed Acyclic Graphs for task execution with parallelism

import { 
  TaskNode, 
  TaskNodeType, 
  TaskStatus, 
  DAG, 
  ExecutionResult 
} from './types';
import { randomUUID } from 'crypto';

// Node type definitions for DAG construction
interface NodeDefinition {
  type: TaskNodeType;
  description: string;
  dependencies: string[];
}

export class TaskPlanner {
  private currentDAG: DAG | null = null;

  // Main planning function - creates DAG from goal
  plan(goal: string): DAG {
    const dagId = randomUUID();
    
    // Parse goal and create task nodes
    const nodes = this.decomposeGoal(goal);
    const nodeMap = new Map<string, TaskNode>();
    const edges: Array<{ from: string; to: string }> = [];

    // Build node map and edges
    for (const node of nodes) {
      nodeMap.set(node.id, node);
      for (const depId of node.dependencies) {
        edges.push({ from: depId, to: node.id });
      }
    }

    // Identify parallel groups (nodes that can run simultaneously)
    const parallelGroups = this.identParallelGroups(nodeMap, edges);

    this.currentDAG = {
      id: dagId,
      goal,
      nodes: nodeMap,
      edges,
      parallelGroups,
      createdAt: new Date(),
      status: 'pending',
    };

    return this.currentDAG;
  }

  // Decompose a goal into task nodes
  private decomposeGoal(goal: string): TaskNode[] {
    const lowerGoal = goal.toLowerCase();
    const nodes: TaskNode[] = [];

    // Analyze goal type and create appropriate nodes
    if (this.isCodeGenerationGoal(lowerGoal)) {
      nodes.push(...this.createCodeGenerationPlan(goal));
    } else if (this.isResearchGoal(lowerGoal)) {
      nodes.push(...this.createResearchPlan(goal));
    } else if (this.isDataProcessingGoal(lowerGoal)) {
      nodes.push(...this.createDataProcessingPlan(goal));
    } else if (this.isApiGoal(lowerGoal)) {
      nodes.push(...this.createApiPlan(goal));
    } else {
      nodes.push(...this.createGeneralPlan(goal));
    }

    return nodes;
  }

  private isCodeGenerationGoal(goal: string): boolean {
    const keywords = ['build', 'create', 'implement', 'develop', 'code', 'write', 'generate'];
    return keywords.some(kw => goal.includes(kw));
  }

  private isResearchGoal(goal: string): boolean {
    const keywords = ['research', 'find', 'search', 'analyze', 'investigate', 'explore'];
    return keywords.some(kw => goal.includes(kw));
  }

  private isDataProcessingGoal(goal: string): boolean {
    const keywords = ['process', 'transform', 'convert', 'parse', 'extract', 'data'];
    return keywords.some(kw => goal.includes(kw));
  }

  private isApiGoal(goal: string): boolean {
    const keywords = ['api', 'endpoint', 'server', 'route', 'rest', 'graphql'];
    return keywords.some(kw => goal.includes(kw));
  }

  private createCodeGenerationPlan(goal: string): TaskNode[] {
    const baseId = randomUUID().slice(0, 8);
    
    return [
      {
        id: `${baseId}-research`,
        type: 'research',
        description: `Research best practices and patterns for: ${goal}`,
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-memory`,
        type: 'memory',
        description: 'Recall relevant previous implementations and patterns',
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-design`,
        type: 'reasoning',
        description: 'Design architecture and structure',
        status: 'pending',
        dependencies: [`${baseId}-research`, `${baseId}-memory`],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-code`,
        type: 'coding',
        description: `Generate code for: ${goal}`,
        status: 'pending',
        dependencies: [`${baseId}-design`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-validate`,
        type: 'validation',
        description: 'Validate and test generated code',
        status: 'pending',
        dependencies: [`${baseId}-code`],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-save`,
        type: 'memory',
        description: 'Save learned patterns to memory',
        status: 'pending',
        dependencies: [`${baseId}-validate`],
        retryCount: 0,
        maxRetries: 2,
      },
    ];
  }

  private createResearchPlan(goal: string): TaskNode[] {
    const baseId = randomUUID().slice(0, 8);
    
    return [
      {
        id: `${baseId}-memory`,
        type: 'memory',
        description: 'Check memory for existing knowledge',
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-search`,
        type: 'research',
        description: `Web search for: ${goal}`,
        status: 'pending',
        dependencies: [`${baseId}-memory`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-fetch`,
        type: 'research',
        description: 'Fetch and extract content from relevant sources',
        status: 'pending',
        dependencies: [`${baseId}-search`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-analyze`,
        type: 'reasoning',
        description: 'Analyze and synthesize findings',
        status: 'pending',
        dependencies: [`${baseId}-fetch`],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-save`,
        type: 'memory',
        description: 'Store research findings in memory',
        status: 'pending',
        dependencies: [`${baseId}-analyze`],
        retryCount: 0,
        maxRetries: 2,
      },
    ];
  }

  private createDataProcessingPlan(goal: string): TaskNode[] {
    const baseId = randomUUID().slice(0, 8);
    
    return [
      {
        id: `${baseId}-read`,
        type: 'file_op',
        description: 'Read and parse input data',
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-validate`,
        type: 'validation',
        description: 'Validate data structure and format',
        status: 'pending',
        dependencies: [`${baseId}-read`],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-process`,
        type: 'coding',
        description: `Process data: ${goal}`,
        status: 'pending',
        dependencies: [`${baseId}-validate`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-write`,
        type: 'file_op',
        description: 'Write processed output',
        status: 'pending',
        dependencies: [`${baseId}-process`],
        retryCount: 0,
        maxRetries: 3,
      },
    ];
  }

  private createApiPlan(goal: string): TaskNode[] {
    const baseId = randomUUID().slice(0, 8);
    
    return [
      {
        id: `${baseId}-research`,
        type: 'research',
        description: 'Research API best practices and patterns',
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-design`,
        type: 'reasoning',
        description: 'Design API structure and endpoints',
        status: 'pending',
        dependencies: [`${baseId}-research`],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-implement`,
        type: 'coding',
        description: `Implement API: ${goal}`,
        status: 'pending',
        dependencies: [`${baseId}-design`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-test`,
        type: 'validation',
        description: 'Test API endpoints',
        status: 'pending',
        dependencies: [`${baseId}-implement`],
        retryCount: 0,
        maxRetries: 2,
      },
    ];
  }

  private createGeneralPlan(goal: string): TaskNode[] {
    const baseId = randomUUID().slice(0, 8);
    
    return [
      {
        id: `${baseId}-analyze`,
        type: 'reasoning',
        description: `Analyze goal: ${goal}`,
        status: 'pending',
        dependencies: [],
        retryCount: 0,
        maxRetries: 2,
      },
      {
        id: `${baseId}-execute`,
        type: 'coding',
        description: 'Execute primary task',
        status: 'pending',
        dependencies: [`${baseId}-analyze`],
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: `${baseId}-validate`,
        type: 'validation',
        description: 'Validate results',
        status: 'pending',
        dependencies: [`${baseId}-execute`],
        retryCount: 0,
        maxRetries: 2,
      },
    ];
  }

  // Identify which nodes can run in parallel
  private identifyParallelGroups(
    nodes: Map<string, TaskNode>,
    edges: Array<{ from: string; to: string }>
  ): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();
    const nodeIds = Array.from(nodes.keys());

    while (processed.size < nodeIds.length) {
      const group: string[] = [];
      
      for (const nodeId of nodeIds) {
        if (processed.has(nodeId)) continue;
        
        const node = nodes.get(nodeId)!;
        const allDepsProcessed = node.dependencies.every(dep => processed.has(dep));
        
        if (allDepsProcessed) {
          group.push(nodeId);
        }
      }
      
      if (group.length === 0) break; // Prevent infinite loop
      
      groups.push(group);
      group.forEach(id => processed.add(id));
    }

    return groups;
  }

  // Get current DAG
  getCurrentDAG(): DAG | null {
    return this.currentDAG;
  }

  // Update node status
  updateNodeStatus(dag: DAG, nodeId: string, status: TaskStatus, result?: unknown, error?: string): void {
    const node = dag.nodes.get(nodeId);
    if (node) {
      node.status = status;
      if (result !== undefined) node.result = result;
      if (error !== undefined) node.error = error;
      if (status === 'running') node.startTime = new Date();
      if (status === 'completed' || status === 'failed') node.endTime = new Date();
    }
  }

  // Get next executable nodes
  getNextNodes(dag: DAG): TaskNode[] {
    const ready: TaskNode[] = [];
    
    for (const node of dag.nodes.values()) {
      if (node.status !== 'pending') continue;
      
      const allDepsComplete = node.dependencies.every(depId => {
        const dep = dag.nodes.get(depId);
        return dep?.status === 'completed';
      });
      
      if (allDepsComplete) {
        ready.push(node);
      }
    }
    
    return ready;
  }

  // Execute DAG with parallel execution support
  async execute(
    dag: DAG,
    executor: (node: TaskNode) => Promise<ExecutionResult>
  ): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();
    dag.status = 'running';

    while (true) {
      const readyNodes = this.getNextNodes(dag);
      
      if (readyNodes.length === 0) {
        // Check if all done or some failed
        const statuses = Array.from(dag.nodes.values()).map(n => n.status);
        if (statuses.every(s => s === 'completed')) {
          dag.status = 'completed';
          break;
        }
        if (statuses.some(s => s === 'failed')) {
          dag.status = 'failed';
          break;
        }
        // No ready nodes but not all done - dependency issue
        break;
      }

      // Execute ready nodes in parallel
      const promises = readyNodes.map(async (node) => {
        this.updateNodeStatus(dag, node.id, 'running');
        try {
          const result = await executor(node);
          this.updateNodeStatus(dag, node.id, 'completed', result.output);
          results.set(node.id, result);
          return { node, result };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          node.retryCount++;
          if (node.retryCount >= node.maxRetries) {
            this.updateNodeStatus(dag, node.id, 'failed', undefined, errorMsg);
          } else {
            this.updateNodeStatus(dag, node.id, 'pending');
          }
          results.set(node.id, { success: false, error: errorMsg, tokensUsed: 0, cost: 0, duration: 0 });
          return { node, error };
        }
      });

      await Promise.all(promises);
    }

    return results;
  }

  // Visualize DAG as ASCII
  visualize(dag: DAG): string {
    let output = `DAG: ${dag.goal}\n`;
    output += '='.repeat(50) + '\n';
    
    for (let i = 0; i < dag.parallelGroups.length; i++) {
      const group = dag.parallelGroups[i];
      output += `\n[Stage ${i + 1}]${group.length > 1 ? ' (Parallel)' : ''}\n`;
      
      for (const nodeId of group) {
        const node = dag.nodes.get(nodeId);
        if (node) {
          const statusIcon = {
            pending: '⏸️',
            running: '⏳',
            completed: '✅',
            failed: '❌',
            paused: '⏸️',
          }[node.status];
          output += `  ${statusIcon} ${node.type}: ${node.description.slice(0, 50)}...\n`;
        }
      }
    }
    
    return output;
  }
}

// Singleton instance
let plannerInstance: TaskPlanner | null = null;

export function getPlanner(): TaskPlanner {
  if (!plannerInstance) {
    plannerInstance = new TaskPlanner();
  }
  return plannerInstance;
}
