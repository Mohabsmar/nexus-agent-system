'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bot, Play, Settings, Database, Mic, MicOff, Zap, Brain, 
  GitBranch, Shield, BarChart3, Search, Download, Upload,
  Terminal, Globe, Code, FileText, MessageSquare, Activity,
  CheckCircle2, XCircle, Clock, DollarSign, Cpu, HardDrive,
  RefreshCw, Trash2, Plus, ChevronRight, AlertTriangle, Info, Key
} from 'lucide-react';

// Types
interface Session {
  id: string;
  goal: string;
  status: string;
  tokensUsed: number;
  cost: number;
  startedAt: string;
  endedAt?: string;
}

interface Provider {
  name: string;
  models: string[];
  status: string;
  latency: number;
  costPerToken: number;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  source: string;
  version: string;
  rating: number;
  installed: boolean;
}

interface MemoryStats {
  episodic: number;
  semantic: number;
  procedural: number;
  preferences: number;
}

interface ApiKey {
  provider: string;
  configured: boolean;
  masked?: string;
}

interface DashboardStats {
  totalRuns: number;
  successRate: number;
  totalTokens: number;
  totalCost: number;
  averageDuration: number;
  activeProviders: number;
  installedSkills: number;
  memoryEntries: number;
}

export default function ZClawDashboard() {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [agentRes, providersRes, skillsRes, memoryRes, keysRes] = await Promise.all([
        fetch('/api/agent'),
        fetch('/api/providers'),
        fetch('/api/skills?installed=true'),
        fetch('/api/memory'),
        fetch('/api/keys'),
      ]);

      if (agentRes.ok) {
        const data = await agentRes.json();
        setStats(data.stats);
        setSessions(data.recentSessions || []);
      }

      if (providersRes.ok) {
        const data = await providersRes.json();
        setProviders(data.providers || []);
      }

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkills(data.skills || []);
      }

      if (memoryRes.ok) {
        const data = await memoryRes.json();
        setMemoryStats(data.stats);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Run task
  const runTask = async () => {
    if (!goal.trim()) {
      setNotification({ type: 'error', message: 'Please enter a goal' });
      return;
    }

    setIsRunning(true);
    setNotification({ type: 'info', message: 'Starting task execution...' });

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          voice: voiceEnabled,
        }),
      });

      const result = await response.json();

      if (result.status === 'completed') {
        setNotification({ type: 'success', message: 'Task completed successfully!' });
      } else {
        setNotification({ type: 'error', message: result.error || 'Task failed' });
      }

      setCurrentSession(result);
      fetchDashboardData();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to execute task' });
    } finally {
      setIsRunning(false);
      setGoal('');
    }
  };

  // Search skills
  const searchSkills = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`/api/skills?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSkills(data.results?.map((r: { skill: Skill }) => r.skill) || []);
    } catch (error) {
      console.error('Skill search failed:', error);
    }
  };

  // Install skill
  const installSkill = async (slug: string) => {
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install', slug }),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({ type: 'success', message: `Skill ${slug} installed!` });
        fetchDashboardData();
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to install skill' });
    }
  };

  // Toggle privacy mode
  const togglePrivacyMode = async (enabled: boolean) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_privacy_mode', enabled }),
      });
      setPrivacyMode(enabled);
      setNotification({ type: 'info', message: enabled ? 'Privacy mode enabled - using local models only' : 'Privacy mode disabled' });
    } catch (error) {
      console.error('Failed to toggle privacy mode:', error);
    }
  };

  // Save API key
  const saveApiKey = async (provider: string, key: string) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', provider, key }),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({ type: 'success', message: `API key for ${provider} saved!` });
        fetchDashboardData();
        setEditingKey(null);
        setNewKeyValue('');
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to save key' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save API key' });
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Z-Claw</h1>
                <p className="text-xs text-gray-400">Zero-Compromise Learning & Agent Workbench</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={privacyMode ? "default" : "secondary"} className="gap-1">
                  <Shield className="w-3 h-3" />
                  {privacyMode ? 'Privacy Mode' : 'Standard'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Voice</span>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>
              
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50">
          <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="w-80">
            {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {notification.type === 'error' && <XCircle className="h-4 w-4" />}
            {notification.type === 'info' && <Info className="h-4 w-4" />}
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="w-4 h-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <Cpu className="w-4 h-4" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Zap className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-2">
              <Database className="w-4 h-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Terminal className="w-4 h-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalRuns || 0}</div>
                  <p className="text-xs text-emerald-400 mt-1">
                    {stats?.successRate.toFixed(1) || 0}% success rate
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Tokens Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</div>
                  <p className="text-xs text-cyan-400 mt-1">
                    Total consumption
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${(stats?.totalCost || 0).toFixed(4)}</div>
                  <p className="text-xs text-amber-400 mt-1">
                    Cumulative spend
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Active Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.activeProviders || 0}</div>
                  <p className="text-xs text-purple-400 mt-1">
                    Healthy endpoints
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Task Input */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-emerald-400" />
                    Quick Task
                  </CardTitle>
                  <CardDescription>Execute a task with default settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter your goal... (e.g., 'Build a REST API with authentication')"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="bg-gray-900 border-gray-600 min-h-[100px]"
                      disabled={isRunning}
                    />
                    <Button 
                      onClick={runTask} 
                      disabled={isRunning || !goal.trim()}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Execute Task
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {sessions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No sessions yet. Run a task to get started!</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              session.status === 'completed' ? 'bg-emerald-400' :
                              session.status === 'failed' ? 'bg-red-400' :
                              session.status === 'running' ? 'bg-amber-400 animate-pulse' :
                              'bg-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{session.goal}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>{session.tokensUsed.toLocaleString()} tokens</span>
                                <span>${session.cost.toFixed(4)}</span>
                                <span>{new Date(session.startedAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.installedSkills || 0}</div>
                  <p className="text-xs text-gray-500">Installed skills</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Memory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.memoryEntries || 0}</div>
                  <p className="text-xs text-gray-500">Total entries</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((stats?.averageDuration || 0) / 1000).toFixed(1)}s</div>
                  <p className="text-xs text-gray-500">Per session</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent Tab */}
          <TabsContent value="agent" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  Agent Execution
                </CardTitle>
                <CardDescription>Configure and run agent tasks with full control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Textarea
                      placeholder="Describe your goal in detail..."
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="bg-gray-900 border-gray-600 min-h-[120px]"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger className="bg-gray-900 border-gray-600">
                          <SelectValue placeholder="Auto-select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-select (Recommended)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                          <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                          <SelectItem value="groq">Groq (Fast)</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Budget Limit ($)</Label>
                      <Input type="number" placeholder="0.10" className="bg-gray-900 border-gray-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Timeout (seconds)</Label>
                      <Input type="number" placeholder="120" className="bg-gray-900 border-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="voice-mode" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                    <Label htmlFor="voice-mode" className="text-sm">Voice Mode</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="auto-confirm" />
                    <Label htmlFor="auto-confirm" className="text-sm">Auto-confirm</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="no-memory" />
                    <Label htmlFor="no-memory" className="text-sm">Skip Memory</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="no-plan" />
                    <Label htmlFor="no-plan" className="text-sm">Skip Planning</Label>
                  </div>
                </div>

                <Button 
                  onClick={runTask}
                  disabled={isRunning || !goal.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Executing Task...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Agent
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {providers.map((provider) => (
                <Card key={provider.name} className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium capitalize">{provider.name}</CardTitle>
                      <Badge variant={provider.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                        {provider.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latency</span>
                        <span>{provider.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cost/token</span>
                        <span>${provider.costPerToken.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Models</span>
                        <span>{provider.models.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Set Default
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Skill Marketplace
                </CardTitle>
                <CardDescription>Search and install skills from ClawdHub, Smithery, npm, and more</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search skills... (e.g., web scraper, api, database)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900 border-gray-600"
                  />
                  <Button onClick={searchSkills}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill) => (
                      <Card key={skill.id} className="bg-gray-900/50 border-gray-600">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{skill.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">{skill.source}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-400 line-clamp-2">{skill.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>★ {skill.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>v{skill.version}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            size="sm" 
                            className="w-full"
                            variant={skill.installed ? 'secondary' : 'default'}
                            onClick={() => !skill.installed && installSkill(skill.slug)}
                            disabled={skill.installed}
                          >
                            {skill.installed ? 'Installed' : 'Install'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Episodic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoryStats?.episodic || 0}</div>
                  <p className="text-xs text-gray-500">Session memories</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Semantic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoryStats?.semantic || 0}</div>
                  <p className="text-xs text-gray-500">Knowledge entries</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Procedural</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoryStats?.procedural || 0}</div>
                  <p className="text-xs text-gray-500">Learned skills</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoryStats?.preferences || 0}</div>
                  <p className="text-xs text-gray-500">User settings</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-cyan-400" />
                  Memory Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input placeholder="Search memories..." className="bg-gray-900 border-gray-600" />
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'File System', icon: FileText, count: 4 },
                { name: 'Shell', icon: Terminal, count: 2 },
                { name: 'Web', icon: Globe, count: 3 },
                { name: 'Code', icon: Code, count: 2 },
                { name: 'Database', icon: Database, count: 1 },
                { name: 'AI', icon: Brain, count: 2 },
                { name: 'Git', icon: GitBranch, count: 2 },
                { name: 'Communication', icon: MessageSquare, count: 1 },
              ].map((category) => (
                <Card key={category.name} className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-emerald-400" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{category.count}</div>
                    <p className="text-xs text-gray-500">Tools available</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Tools
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  API Keys Configuration
                </CardTitle>
                <CardDescription>Configure your AI provider API keys. Keys are stored securely and masked for display.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.provider} className="flex items-center gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-600">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{apiKey.provider}</span>
                            {apiKey.configured ? (
                              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Configured</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Not Set</Badge>
                            )}
                          </div>
                          {apiKey.configured && apiKey.masked && (
                            <p className="text-xs text-gray-500 mt-1">{apiKey.masked}</p>
                          )}
                        </div>
                        
                        {editingKey === apiKey.provider ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              placeholder="Enter new API key..."
                              value={newKeyValue}
                              onChange={(e) => setNewKeyValue(e.target.value)}
                              className="bg-gray-800 border-gray-600 w-64"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => saveApiKey(apiKey.provider, newKeyValue)}
                              disabled={!newKeyValue.trim()}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => { setEditingKey(null); setNewKeyValue(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingKey(apiKey.provider)}
                          >
                            {apiKey.configured ? 'Update' : 'Add Key'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Need API Keys?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-900/50 hover:bg-gray-700/50 text-center transition-colors">
                    Anthropic
                  </a>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-900/50 hover:bg-gray-700/50 text-center transition-colors">
                    OpenAI
                  </a>
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-900/50 hover:bg-gray-700/50 text-center transition-colors">
                    Groq
                  </a>
                  <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-900/50 hover:bg-gray-700/50 text-center transition-colors">
                    Mistral
                  </a>
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-900/50 hover:bg-gray-700/50 text-center transition-colors">
                    Google AI
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Privacy Mode</Label>
                      <p className="text-xs text-gray-500">Use local models only (Ollama)</p>
                    </div>
                    <Switch checked={privacyMode} onCheckedChange={togglePrivacyMode} />
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="space-y-2">
                    <Label>File System Access</Label>
                    <Select defaultValue="ask">
                      <SelectTrigger className="bg-gray-900 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="granted">Granted</SelectItem>
                        <SelectItem value="ask">Ask</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Shell Commands</Label>
                    <Select defaultValue="granted">
                      <SelectTrigger className="bg-gray-900 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="granted">Granted</SelectItem>
                        <SelectItem value="ask">Ask</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-cyan-400" />
                    Voice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voice Mode</Label>
                      <p className="text-xs text-gray-500">Enable voice input/output</p>
                    </div>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="space-y-2">
                    <Label>TTS Provider</Label>
                    <Select defaultValue="openai_tts">
                      <SelectTrigger className="bg-gray-900 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="openai_tts">OpenAI TTS</SelectItem>
                        <SelectItem value="coqui">Coqui (Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Voice Persona</Label>
                    <Select defaultValue="assistant">
                      <SelectTrigger className="bg-gray-900 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900/80 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>Z-Claw v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built by Mohab & VoiceClaw</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
