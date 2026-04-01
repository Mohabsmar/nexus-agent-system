import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/nexus';

// GET /api/tools - Get all tools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const agent = getAgent();
    const tools = agent.getTools();

    if (category) {
      const filtered = tools.getToolsByCategory(category as 'file_system' | 'shell' | 'web' | 'code' | 'database' | 'ai' | 'git' | 'communication');
      return NextResponse.json({ tools: filtered });
    }

    const allTools = tools.getAllTools();
    const history = tools.getToolCallHistory();
    const broken = tools.getBrokenTools();

    // Group by category
    const byCategory: Record<string, typeof allTools> = {};
    for (const tool of allTools) {
      if (!byCategory[tool.category]) {
        byCategory[tool.category] = [];
      }
      byCategory[tool.category].push(tool);
    }

    return NextResponse.json({
      tools: allTools,
      byCategory,
      history: history.slice(-50),
      brokenTools: broken,
    });
  } catch (error) {
    console.error('Tools fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tools - Execute a tool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, params } = body;

    if (!tool) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }

    const agent = getAgent();
    const tools = agent.getTools();

    // Check if tool exists
    const toolDef = tools.getTool(tool);
    if (!toolDef) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Validate parameters
    const validation = tools.validateParameters(toolDef, params || {});
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    // Execute with self-healing
    const result = await tools.executeWithHealing(
      tool,
      params || {},
      async () => {
        // Simulate tool execution
        await new Promise(r => setTimeout(r, Math.random() * 500 + 100));
        return { result: `Executed ${tool}` };
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
