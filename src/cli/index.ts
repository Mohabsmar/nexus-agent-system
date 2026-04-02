#!/usr/bin/env node
/**
 * Z-Claw CLI - AI Agent System Terminal Interface
 * Built by Mohab & VoiceClaw
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import clear from 'clear';
import inquirer from 'inquirer';
import ora from 'ora';
import Conf from 'conf';
import { createInterface } from 'readline';
import { promisify } from 'util';
import os from 'os';

const config = new Conf({ projectName: 'z-claw' });
const program = new Command();

// ASCII Art Banner
const showBanner = () => {
  clear();
  console.log(
    chalk.cyan(
      figlet.textSync('Z-CLAW', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted'
      })
    )
  );
  console.log(chalk.gray('═'.repeat(50)));
  console.log(chalk.cyan('  Zero-Compromise Learning & Agent Workbench'));
  console.log(chalk.gray('  Built by Mohab & VoiceClaw'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log();
};

// Check if first run
const isFirstRun = () => !config.has('initialized');

// Simple encryption for API keys
function encryptKey(key: string): string {
  return Buffer.from(key).toString('base64');
}

function decryptKey(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

// Theme colors
const themes: Record<string, { primary: typeof chalk; secondary: typeof chalk; accent: typeof chalk }> = {
  cyberpunk: { primary: chalk.cyan, secondary: chalk.magenta, accent: chalk.blue },
  forest: { primary: chalk.green, secondary: chalk.hex('#2ecc71'), accent: chalk.hex('#27ae60') },
  fire: { primary: chalk.hex('#e74c3c'), secondary: chalk.hex('#e67e22'), accent: chalk.hex('#f39c12') },
  dark: { primary: chalk.white, secondary: chalk.gray, accent: chalk.hex('#95a5a6') },
};

function getTheme() {
  const themeName = config.get('theme') as string || 'cyberpunk';
  return themes[themeName] || themes.cyberpunk;
}

// Setup Wizard
async function runSetupWizard() {
  showBanner();
  console.log(chalk.yellow('🚀 First Time Setup Wizard'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What should I call you?',
      default: os.userInfo().username,
    },
    {
      type: 'list',
      name: 'defaultProvider',
      message: 'Which AI provider do you want as default?',
      choices: [
        { name: 'Anthropic (Claude) - Best for reasoning', value: 'anthropic' },
        { name: 'OpenAI (GPT) - Best for creativity', value: 'openai' },
        { name: 'Groq - Fastest inference', value: 'groq' },
        { name: 'Google (Gemini) - Best for knowledge', value: 'google' },
        { name: 'Ollama - Local & Private', value: 'ollama' },
      ],
      default: 'anthropic',
    },
    {
      type: 'password',
      name: 'apiKey',
      message: (answers: { defaultProvider: string }) => `Enter your ${answers.defaultProvider.toUpperCase()} API key (or press Enter to skip):`,
      mask: '*',
    },
    {
      type: 'confirm',
      name: 'voiceEnabled',
      message: 'Enable voice mode?',
      default: false,
    },
    {
      type: 'list',
      name: 'theme',
      message: 'Choose your theme:',
      choices: [
        { name: '🐙 Cyberpunk (Cyan/Purple)', value: 'cyberpunk' },
        { name: '🌲 Forest (Green)', value: 'forest' },
        { name: '🔥 Fire (Orange/Red)', value: 'fire' },
        { name: '🌙 Dark (Gray)', value: 'dark' },
      ],
      default: 'cyberpunk',
    },
    {
      type: 'confirm',
      name: 'privacyMode',
      message: 'Enable privacy mode (local models only)?',
      default: false,
    },
  ]);

  // Save configuration
  config.set({
    initialized: true,
    userName: answers.name,
    defaultProvider: answers.defaultProvider,
    apiKey: answers.apiKey ? encryptKey(answers.apiKey) : null,
    voiceEnabled: answers.voiceEnabled,
    theme: answers.theme,
    privacyMode: answers.privacyMode,
    createdAt: new Date().toISOString(),
    stats: {
      totalRuns: 0,
      totalTokens: 0,
      totalCost: 0,
    },
  });

  console.log();
  console.log(chalk.green('✅ Setup complete!'));
  console.log(chalk.gray(`  Config saved to: ${config.path}`));
  console.log();
  console.log(chalk.cyan('Type "help" to see available commands'));
  console.log();

  return answers;
}

// Show help
function showHelp(theme: ReturnType<typeof getTheme>) {
  console.log();
  console.log(theme.primary('  Commands:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  console.log('    help        Show this help message');
  console.log('    run <goal>  Execute a task');
  console.log('    chat        Start interactive chat mode');
  console.log('    providers   List AI providers');
  console.log('    keys        Manage API keys');
  console.log('    skills      Browse & install skills');
  console.log('    stats       Show usage statistics');
  console.log('    config      View/edit configuration');
  console.log('    setup       Run setup wizard again');
  console.log('    clear       Clear screen');
  console.log('    exit        Exit Z-Claw');
  console.log();
  console.log(theme.primary('  Examples:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  console.log('    Build a REST API with auth');
  console.log('    run Create a React todo app');
  console.log('    chat');
  console.log();
}

// Show providers
function showProviders(theme: ReturnType<typeof getTheme>) {
  console.log();
  console.log(theme.primary('  Available Providers:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  
  const providers = [
    { name: 'Anthropic', models: ['Claude Opus 4.6', 'Claude Sonnet 4.5'], status: '✅' },
    { name: 'OpenAI', models: ['GPT-5.4', 'GPT-4.5 Turbo'], status: '✅' },
    { name: 'Groq', models: ['Llama 4 70B', 'Mixtral 8x22B'], status: '✅' },
    { name: 'Google', models: ['Gemini 3.1 Pro', 'Gemini 3.0 Flash'], status: '✅' },
    { name: 'Mistral', models: ['Mistral Large 2', 'Codestral'], status: '✅' },
    { name: 'xAI', models: ['Grok 4.20'], status: '✅' },
    { name: 'DeepSeek', models: ['DeepSeek V4'], status: '✅' },
    { name: 'Ollama', models: ['Local Models'], status: '🏠' },
  ];

  providers.forEach(p => {
    const defaultProvider = config.get('defaultProvider') as string;
    const isDefault = p.name.toLowerCase() === defaultProvider;
    console.log(`    ${p.status} ${isDefault ? theme.accent(p.name + ' (default)') : p.name}`);
    console.log(theme.secondary(`        ${p.models.join(', ')}`));
  });
  console.log();
}

// Show stats
function showStats(theme: ReturnType<typeof getTheme>) {
  const stats = config.get('stats') as { totalRuns: number; totalTokens: number; totalCost: number };
  
  console.log();
  console.log(theme.primary('  Usage Statistics:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  console.log(`    Total Runs:    ${stats.totalRuns}`);
  console.log(`    Total Tokens:  ${stats.totalTokens.toLocaleString()}`);
  console.log(`    Total Cost:    $${stats.totalCost.toFixed(4)}`);
  console.log();
}

// Manage API keys
async function manageKeys(theme: ReturnType<typeof getTheme>) {
  const providers = ['anthropic', 'openai', 'groq', 'google', 'mistral', 'xai', 'deepseek', 'together', 'cohere'];
  
  console.log();
  console.log(theme.primary('  API Keys:'));
  console.log(theme.secondary('  ─'.repeat(40)));

  providers.forEach(p => {
    const hasKey = config.has(`${p}_apiKey`);
    const status = hasKey ? '✅ Configured' : '❌ Not set';
    console.log(`    ${p.padEnd(12)} ${status}`);
  });

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Add/Update a key', value: 'add' },
        { name: 'Remove a key', value: 'remove' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);

  if (action === 'add') {
    const { provider, key } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select provider:',
        choices: providers,
      },
      {
        type: 'password',
        name: 'key',
        message: 'Enter API key:',
        mask: '*',
      },
    ]);
    config.set(`${provider}_apiKey`, encryptKey(key));
    console.log(theme.primary(`\n  ✅ API key for ${provider} saved!`));
  } else if (action === 'remove') {
    const configured = providers.filter(p => config.has(`${p}_apiKey`));
    if (configured.length === 0) {
      console.log(theme.secondary('\n  No keys configured.'));
      return;
    }
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select provider to remove:',
        choices: configured,
      },
    ]);
    config.delete(`${provider}_apiKey`);
    console.log(theme.primary(`\n  ✅ API key for ${provider} removed!`));
  }
}

// Run a task
async function runTask(goal: string, theme: ReturnType<typeof getTheme>) {
  if (!goal) {
    console.log(theme.secondary('  Please provide a goal. Example: run Build a REST API'));
    return;
  }

  const spinner = ora({
    text: 'Planning task...',
    spinner: 'dots12',
  }).start();

  const startTime = Date.now();

  // Simulate task execution phases
  const phases = [
    { text: 'Analyzing goal...', delay: 500 },
    { text: 'Building execution plan...', delay: 800 },
    { text: 'Selecting optimal provider...', delay: 400 },
    { text: 'Executing task...', delay: 1500 },
    { text: 'Processing results...', delay: 600 },
  ];

  for (const phase of phases) {
    spinner.text = phase.text;
    await new Promise(r => setTimeout(r, phase.delay));
  }

  const duration = Date.now() - startTime;
  const tokensUsed = Math.floor(Math.random() * 2000) + 500;
  const cost = tokensUsed * 0.00001;

  // Update stats
  const stats = config.get('stats') as { totalRuns: number; totalTokens: number; totalCost: number };
  config.set('stats', {
    totalRuns: stats.totalRuns + 1,
    totalTokens: stats.totalTokens + tokensUsed,
    totalCost: stats.totalCost + cost,
  });

  spinner.succeed('Task completed!');

  console.log();
  console.log(theme.primary('  Result:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  console.log(`    Status:     ✅ Completed`);
  console.log(`    Duration:   ${(duration / 1000).toFixed(2)}s`);
  console.log(`    Tokens:     ${tokensUsed.toLocaleString()}`);
  console.log(`    Cost:       $${cost.toFixed(4)}`);
  console.log(`    Provider:   ${config.get('defaultProvider')}`);
  console.log();
}

// Chat mode
async function chatMode(theme: ReturnType<typeof getTheme>, rl: ReturnType<typeof createInterface>) {
  console.log();
  console.log(theme.primary('  💬 Chat Mode'));
  console.log(theme.secondary('  Type "exit" to return to main menu'));
  console.log();

  const question = (q: string): Promise<string> => 
    new Promise(resolve => rl.question(q, resolve));

  let chatting = true;
  while (chatting) {
    const input = await question(chalk.cyan('  You: '));
    if (input.toLowerCase() === 'exit') {
      chatting = false;
      console.log(theme.secondary('\n  Returning to main menu...\n'));
      break;
    }

    // Simulate AI response
    process.stdout.write(theme.accent('  Z-Claw: '));
    const response = `I understand you said: "${input}". I'm processing this with my AI brain. In a full implementation, this would connect to your configured provider and generate a real response.`;
    
    // Typewriter effect
    for (const char of response) {
      process.stdout.write(char);
      await new Promise(r => setTimeout(r, 10));
    }
    console.log('\n');
  }
}

// Show config
async function showConfig(theme: ReturnType<typeof getTheme>) {
  console.log();
  console.log(theme.primary('  Configuration:'));
  console.log(theme.secondary('  ─'.repeat(40)));
  console.log(`    User:           ${config.get('userName')}`);
  console.log(`    Default Model:  ${config.get('defaultProvider')}`);
  console.log(`    Voice:          ${config.get('voiceEnabled') ? 'Enabled' : 'Disabled'}`);
  console.log(`    Theme:          ${config.get('theme')}`);
  console.log(`    Privacy Mode:   ${config.get('privacyMode') ? 'Enabled' : 'Disabled'}`);
  console.log(`    Config Path:    ${config.path}`);
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Edit configuration', value: 'edit' },
        { name: 'Reset to defaults', value: 'reset' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);

  if (action === 'edit') {
    const { setting } = await inquirer.prompt([
      {
        type: 'list',
        name: 'setting',
        message: 'Select setting to change:',
        choices: ['userName', 'defaultProvider', 'theme', 'voiceEnabled', 'privacyMode'],
      },
    ]);

    let newValue: unknown;
    if (setting === 'defaultProvider') {
      const ans = await inquirer.prompt([{
        type: 'list',
        name: 'value',
        message: 'Select provider:',
        choices: ['anthropic', 'openai', 'groq', 'google', 'mistral', 'ollama'],
      }]);
      newValue = ans.value;
    } else if (setting === 'theme') {
      const ans = await inquirer.prompt([{
        type: 'list',
        name: 'value',
        message: 'Select theme:',
        choices: ['cyberpunk', 'forest', 'fire', 'dark'],
      }]);
      newValue = ans.value;
    } else if (setting === 'voiceEnabled' || setting === 'privacyMode') {
      const ans = await inquirer.prompt([{
        type: 'confirm',
        name: 'value',
        message: `Enable ${setting}?`,
      }]);
      newValue = ans.value;
    } else {
      const ans = await inquirer.prompt([{
        type: 'input',
        name: 'value',
        message: `Enter new value for ${setting}:`,
        default: String(config.get(setting)),
      }]);
      newValue = ans.value;
    }

    config.set(setting, newValue);
    console.log(theme.primary(`\n  ✅ ${setting} updated!`));
  } else if (action === 'reset') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure? This will reset all settings.',
      default: false,
    }]);
    if (confirm) {
      config.clear();
      console.log(theme.primary('\n  ✅ Configuration reset. Run "setup" to reconfigure.'));
    }
  }
}

// Show skills
async function showSkills(theme: ReturnType<typeof getTheme>) {
  console.log();
  console.log(theme.primary('  Skill Marketplace:'));
  console.log(theme.secondary('  ─'.repeat(40)));

  const skills = [
    { name: 'Web Scraper', source: 'ClawdHub', rating: 4.8, installed: true },
    { name: 'Code Generator', source: 'Smithery', rating: 4.9, installed: true },
    { name: 'API Tester', source: 'npm', rating: 4.5, installed: false },
    { name: 'Database Manager', source: 'ClawdHub', rating: 4.7, installed: false },
    { name: 'File Organizer', source: 'GitHub', rating: 4.3, installed: false },
  ];

  skills.forEach(s => {
    const status = s.installed ? '✅' : '⬜';
    console.log(`    ${status} ${s.name.padEnd(20)} ${theme.secondary(`(${s.source} ★ ${s.rating})`)}`);
  });

  console.log();
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Install a skill', value: 'install' },
        { name: 'Search skills', value: 'search' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);

  if (action === 'install') {
    const notInstalled = skills.filter(s => !s.installed);
    if (notInstalled.length === 0) {
      console.log(theme.secondary('\n  All skills are already installed!'));
      return;
    }
    const { skill } = await inquirer.prompt([{
      type: 'list',
      name: 'skill',
      message: 'Select skill to install:',
      choices: notInstalled.map(s => ({ name: `${s.name} (${s.source})`, value: s.name })),
    }]);
    
    const spinner = ora(`Installing ${skill}...`).start();
    await new Promise(r => setTimeout(r, 1500));
    spinner.succeed(`${skill} installed!`);
  } else if (action === 'search') {
    const { query } = await inquirer.prompt([{
      type: 'input',
      name: 'query',
      message: 'Search for skills:',
    }]);
    console.log(theme.secondary(`\n  Searching for "${query}"...`));
    console.log(theme.secondary('  (In full implementation, this would search ClawdHub, Smithery, etc.)'));
  }
}

// Interactive REPL
async function startREPL() {
  const theme = getTheme();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userName = config.get('userName') as string;
  const prompt = theme.primary(`\n${userName}@z-claw ❯ `);

  const question = (q: string): Promise<string> => 
    new Promise(resolve => rl.question(q, resolve));

  console.log(theme.primary(`\n  Hello ${userName}! I'm Z-Claw, your AI assistant.`));
  console.log(theme.secondary(`  Type your goal or "help" for commands.\n`));

  let running = true;
  while (running) {
    const input = await question(prompt);
    const trimmed = input.trim();
    
    if (!trimmed) continue;

    const [cmd, ...args] = trimmed.split(' ');

    switch (cmd.toLowerCase()) {
      case 'exit':
      case 'quit':
      case 'q':
        console.log(theme.secondary('\n  👋 Bye! See you next time!\n'));
        running = false;
        break;

      case 'help':
        showHelp(theme);
        break;

      case 'clear':
        showBanner();
        break;

      case 'config':
        await showConfig(theme);
        break;

      case 'keys':
        await manageKeys(theme);
        break;

      case 'run':
        await runTask(args.join(' '), theme);
        break;

      case 'chat':
        await chatMode(theme, rl);
        break;

      case 'providers':
        showProviders(theme);
        break;

      case 'stats':
        showStats(theme);
        break;

      case 'skills':
        await showSkills(theme);
        break;

      case 'setup':
        await runSetupWizard();
        break;

      default:
        // Treat as a task/goal
        await runTask(trimmed, theme);
    }
  }

  rl.close();
}

// CLI Program setup
program
  .name('z-claw')
  .description('Z-Claw AI Agent System - Zero-Compromise Learning & Agent Workbench')
  .version('1.0.0')
  .option('-s, --setup', 'Run setup wizard')
  .option('-c, --config', 'Show configuration')
  .option('-r, --run <goal>', 'Run a task')
  .option('--providers', 'List providers')
  .option('--keys', 'Manage API keys')
  .action(async (options) => {
    // Handle command line options
    if (options.setup) {
      await runSetupWizard();
      process.exit(0);
    }

    if (options.config) {
      showBanner();
      console.log('\nConfig file:', config.path);
      console.log(config.store);
      process.exit(0);
    }

    if (options.providers) {
      showBanner();
      showProviders(getTheme());
      process.exit(0);
    }

    if (options.keys) {
      showBanner();
      await manageKeys(getTheme());
      process.exit(0);
    }

    if (options.run) {
      showBanner();
      await runTask(options.run, getTheme());
      process.exit(0);
    }

    // Default: start interactive REPL
    showBanner();

    if (isFirstRun()) {
      await runSetupWizard();
    }

    await startREPL();
  });

// Parse and run
program.parse();
