// Z-Claw Tool Registry with Self-Healing Execution
// Comprehensive tool system with 4-layer resilience

import {
  Tool,
  ToolCategory,
  ToolCall,
  SelfHealingResult,
  JSONSchema,
} from './types';
import { randomUUID } from 'crypto';

// Built-in tools registry
const BUILTIN_TOOLS: Tool[] = [
  // File System Tools
  {
    name: 'read_file',
    category: 'file_system',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to read' },
        encoding: { type: 'string', enum: ['utf-8', 'binary'], description: 'File encoding' },
      },
    },
    requiredParams: ['path'],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'write_file',
    category: 'file_system',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to write' },
        content: { type: 'string', description: 'Content to write' },
      },
    },
    requiredParams: ['path', 'content'],
    destructive: true,
    requiresConfirmation: true,
  },
  {
    name: 'delete_file',
    category: 'file_system',
    description: 'Delete a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to delete' },
      },
    },
    requiredParams: ['path'],
    destructive: true,
    requiresConfirmation: true,
  },
  {
    name: 'list_directory',
    category: 'file_system',
    description: 'List contents of a directory',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' },
        recursive: { type: 'boolean', description: 'List recursively' },
      },
    },
    requiredParams: ['path'],
    destructive: false,
    requiresConfirmation: false,
  },

  // Shell Tools
  {
    name: 'run_bash',
    category: 'shell',
    description: 'Execute a bash command',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        timeout: { type: 'number', description: 'Timeout in milliseconds' },
        cwd: { type: 'string', description: 'Working directory' },
      },
    },
    requiredParams: ['command'],
    destructive: false,
    requiresConfirmation: true,
  },
  {
    name: 'run_python',
    category: 'shell',
    description: 'Execute Python code',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Python code to execute' },
        timeout: { type: 'number', description: 'Timeout in milliseconds' },
      },
    },
    requiredParams: ['code'],
    destructive: false,
    requiresConfirmation: false,
  },

  // Web Tools
  {
    name: 'web_search',
    category: 'web',
    description: 'Search the web for information',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        numResults: { type: 'number', description: 'Number of results' },
      },
    },
    requiredParams: ['query'],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'web_fetch',
    category: 'web',
    description: 'Fetch content from a URL',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
        render: { type: 'boolean', description: 'Render JavaScript' },
      },
    },
    requiredParams: ['url'],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'http_request',
    category: 'web',
    description: 'Make an HTTP request',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Request URL' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        headers: { type: 'object', description: 'Request headers' },
        body: { type: 'string', description: 'Request body' },
      },
    },
    requiredParams: ['url'],
    destructive: false,
    requiresConfirmation: true,
  },

  // Code Tools
  {
    name: 'code_lint',
    category: 'code',
    description: 'Lint code for errors',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to lint' },
        language: { type: 'string', description: 'Programming language' },
      },
    },
    requiredParams: ['code'],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'code_format',
    category: 'code',
    description: 'Format code',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to format' },
        language: { type: 'string', description: 'Programming language' },
      },
    },
    requiredParams: ['code'],
    destructive: false,
    requiresConfirmation: false,
  },

  // Database Tools
  {
    name: 'sql_query',
    category: 'database',
    description: 'Execute SQL query',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL query' },
        connection: { type: 'string', description: 'Connection string' },
      },
    },
    requiredParams: ['query'],
    destructive: true,
    requiresConfirmation: true,
  },

  // AI Tools
  {
    name: 'llm_call',
    category: 'ai',
    description: 'Call an LLM model',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Prompt text' },
        model: { type: 'string', description: 'Model to use' },
        temperature: { type: 'number', description: 'Temperature' },
      },
    },
    requiredParams: ['prompt'],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'image_generate',
    category: 'ai',
    description: 'Generate an image from text',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Image description' },
        size: { type: 'string', description: 'Image size' },
      },
    },
    requiredParams: ['prompt'],
    destructive: false,
    requiresConfirmation: false,
  },

  // Git Tools
  {
    name: 'git_status',
    category: 'git',
    description: 'Check git repository status',
    parameters: {
      type: 'object',
      properties: {
        cwd: { type: 'string', description: 'Repository path' },
      },
    },
    requiredParams: [],
    destructive: false,
    requiresConfirmation: false,
  },
  {
    name: 'git_commit',
    category: 'git',
    description: 'Commit changes',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit message' },
        files: { type: 'array', items: { type: 'string' }, description: 'Files to commit' },
      },
    },
    requiredParams: ['message'],
    destructive: true,
    requiresConfirmation: true,
  },
];

// Error types for self-healing
type ErrorType = 'AUTH_ERROR' | 'RATE_LIMIT' | 'NOT_FOUND' | 'PARSE_ERROR' | 'PERMISSION_DENIED' | 'DEPENDENCY_MISSING' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN';

interface ErrorClassification {
  type: ErrorType;
  recoverable: boolean;
  suggestedAction: string;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private toolCalls: Map<string, ToolCall> = new Map();
  private errorCounts: Map<string, number> = new Map();

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    for (const tool of BUILTIN_TOOLS) {
      this.tools.set(tool.name, tool);
    }
  }

  // Register a custom tool
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  // Get tool by name
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  // Get all tools
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  // Get tools by category
  getToolsByCategory(category: ToolCategory): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  // Validate parameters against tool schema
  validateParameters(tool: Tool, params: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required parameters
    for (const required of tool.requiredParams) {
      if (!(required in params)) {
        errors.push(`Missing required parameter: ${required}`);
      }
    }

    // Type validation (simplified)
    const schema = tool.parameters;
    if (schema.properties) {
      for (const [key, value] of Object.entries(params)) {
        const propSchema = schema.properties[key];
        if (propSchema) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (propSchema.type && actualType !== propSchema.type && !(propSchema.type === 'object' && actualType === 'object')) {
            errors.push(`Parameter ${key} should be ${propSchema.type}, got ${actualType}`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Classify error for self-healing
  private classifyError(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return { type: 'AUTH_ERROR', recoverable: true, suggestedAction: 'Refresh token or ask user for credentials' };
    }
    if (message.includes('rate limit') || message.includes('too many') || message.includes('429')) {
      return { type: 'RATE_LIMIT', recoverable: true, suggestedAction: 'Wait and retry, or switch to backup provider' };
    }
    if (message.includes('not found') || message.includes('404')) {
      return { type: 'NOT_FOUND', recoverable: true, suggestedAction: 'Search for alternative resource' };
    }
    if (message.includes('parse') || message.includes('json') || message.includes('syntax')) {
      return { type: 'PARSE_ERROR', recoverable: true, suggestedAction: 'Re-prompt LLM with error context' };
    }
    if (message.includes('permission') || message.includes('access denied')) {
      return { type: 'PERMISSION_DENIED', recoverable: false, suggestedAction: 'Ask user for elevated permissions' };
    }
    if (message.includes('dependency') || message.includes('not installed') || message.includes('module not found')) {
      return { type: 'DEPENDENCY_MISSING', recoverable: true, suggestedAction: 'Auto-install dependency and retry' };
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return { type: 'TIMEOUT', recoverable: true, suggestedAction: 'Increase timeout and retry' };
    }
    if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
      return { type: 'NETWORK_ERROR', recoverable: true, suggestedAction: 'Retry with exponential backoff' };
    }
    
    return { type: 'UNKNOWN', recoverable: false, suggestedAction: 'Log and escalate to user' };
  }

  // Execute tool with self-healing
  async executeWithHealing(
    toolName: string,
    params: Record<string, unknown>,
    executor: (tool: Tool, params: Record<string, unknown>) => Promise<unknown>,
    maxRetries = 3
  ): Promise<SelfHealingResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        recoveredFrom: 'user_intervention',
        attempts: 0,
        finalError: `Tool not found: ${toolName}`,
      };
    }

    // Validate parameters
    const validation = this.validateParameters(tool, params);
    if (!validation.valid) {
      return {
        success: false,
        recoveredFrom: 'user_intervention',
        attempts: 0,
        finalError: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    let attempts = 0;
    let lastError: Error | null = null;
    const backoffMs = 1000;

    while (attempts < maxRetries) {
      attempts++;
      
      try {
        const result = await executor(tool, params);
        
        // Success - reset error count
        this.errorCounts.delete(toolName);
        
        return {
          success: true,
          recoveredFrom: attempts > 1 ? 'retry' : 'retry',
          attempts,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const classification = this.classifyError(lastError);
        
        // Track errors
        const currentCount = this.errorCounts.get(toolName) || 0;
        this.errorCounts.set(toolName, currentCount + 1);
        
        // Non-recoverable errors fail immediately
        if (!classification.recoverable) {
          return {
            success: false,
            recoveredFrom: 'user_intervention',
            attempts,
            finalError: `${classification.type}: ${lastError.message}`,
          };
        }
        
        // Rate limit: wait longer
        if (classification.type === 'RATE_LIMIT') {
          await new Promise(r => setTimeout(r, backoffMs * attempts * 2));
        } else {
          await new Promise(r => setTimeout(r, backoffMs * attempts));
        }
      }
    }

    // All retries exhausted - try fallback tool
    const fallbackResult = await this.tryFallbackTool(tool, params, executor);
    if (fallbackResult.success) {
      return {
        success: true,
        recoveredFrom: 'replacement',
        attempts: attempts + 1,
      };
    }

    return {
      success: false,
      recoveredFrom: 'user_intervention',
      attempts,
      finalError: lastError?.message || 'Unknown error',
    };
  }

  // Try to find and use a fallback tool
  private async tryFallbackTool(
    originalTool: Tool,
    params: Record<string, unknown>,
    executor: (tool: Tool, params: Record<string, unknown>) => Promise<unknown>
  ): Promise<{ success: boolean }> {
    // Find tools in the same category that aren't broken
    const alternatives = this.getToolsByCategory(originalTool.category)
      .filter(t => t.name !== originalTool.name && (this.errorCounts.get(t.name) || 0) < 3);

    for (const altTool of alternatives) {
      try {
        await executor(altTool, params);
        return { success: true };
      } catch {
        continue;
      }
    }

    return { success: false };
  }

  // Create a tool call record
  createToolCall(toolName: string, params: Record<string, unknown>): ToolCall {
    const call: ToolCall = {
      id: randomUUID(),
      tool: toolName,
      parameters: params,
      status: 'pending',
      retryCount: 0,
    };
    this.toolCalls.set(call.id, call);
    return call;
  }

  // Update tool call status
  updateToolCallStatus(
    callId: string,
    status: ToolCall['status'],
    result?: unknown,
    error?: string
  ): void {
    const call = this.toolCalls.get(callId);
    if (call) {
      call.status = status;
      if (result !== undefined) call.result = result;
      if (error !== undefined) call.error = error;
    }
  }

  // Get tool call history
  getToolCallHistory(): ToolCall[] {
    return Array.from(this.toolCalls.values());
  }

  // Get broken tools (high error count)
  getBrokenTools(): string[] {
    return Array.from(this.errorCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([name]) => name);
  }

  // Reset error counts for a tool
  resetToolErrors(toolName: string): void {
    this.errorCounts.delete(toolName);
  }
}

// Singleton instance
let registryInstance: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
  if (!registryInstance) {
    registryInstance = new ToolRegistry();
  }
  return registryInstance;
}

export { BUILTIN_TOOLS };
