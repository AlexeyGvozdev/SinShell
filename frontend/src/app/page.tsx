'use client';

import { Terminal } from '@/components/Terminal';
import { CommandExecutor } from '@/lib/commands/executor';
import { DefaultCommandRegistry } from '@/lib/commands/registry';
import { helpCommand } from '@/lib/commands/builtins/help';
import { clearCommand } from '@/lib/commands/builtins/clear';
import { aboutCommand } from '@/lib/commands/builtins/about';
import { themeCommand } from '@/lib/commands/builtins/theme';
import { useMemo } from 'react';

export default function Home() {
  // Создаем реестр команд и регистрируем встроенные команды
  const { registry, executor } = useMemo(() => {
    const reg = new DefaultCommandRegistry();
    
    // Регистрируем встроенные команды
    reg.register(helpCommand);
    reg.register(clearCommand);
    reg.register(aboutCommand);
    reg.register(themeCommand);
    
    const exec = new CommandExecutor(reg);
    
    return { registry: reg, executor: exec };
  }, []);

  // Обработчик команд
  const handleCommand = async (command: string) => {
    const result = await executor.execute(command);
    
    if (result.type === 'error') {
      return <span className="error-message">{result.output}</span>;
    }
    
    return result.output;
  };

  const welcomeMessage = (
    <div className="terminal-welcome">
      <div className="title terminal-glow-green">
        ╔══════════════════════════════════════════════════════════════╗
        ║                    SinShell Terminal v1.0                    ║
        ║              Интерактивный терминал-портфолио                ║
        ╚══════════════════════════════════════════════════════════════╝
      </div>
      <div className="subtitle">
        <span className="terminal-glow-cyan">Добро пожаловать в SinShell!</span>
      </div>
      <div className="subtitle" style={{ marginTop: '0.5rem' }}>
        Введите <span className="terminal-glow-cyan">help</span> для списка доступных команд.
      </div>
      <div className="subtitle" style={{ marginTop: '0.25rem' }}>
        Попробуйте: <span className="terminal-glow-cyan">about</span>, <span className="terminal-glow-cyan">theme list</span>, <span className="terminal-glow-cyan">clear</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <Terminal 
        onCommand={handleCommand}
        welcomeMessage={welcomeMessage}
        title="SinShell Terminal - user@sinshell:~"
      />
    </main>
  );
}
