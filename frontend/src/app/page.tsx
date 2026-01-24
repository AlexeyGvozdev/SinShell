'use client';

import { Terminal } from '@/components/Terminal';
import { createFullCommandExecutor } from '@/lib/commands';
import { useMemo } from 'react';

export default function Home() {
  // Создаем executor со всеми командами (встроенными + API)
  const executor = useMemo(() => {
    return createFullCommandExecutor();
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
        Попробуйте: <span className="terminal-glow-cyan">about</span>, <span className="terminal-glow-cyan">theme list</span>, <span className="terminal-glow-cyan">ping</span>, <span className="terminal-glow-cyan">health</span>
      </div>
      <div className="subtitle" style={{ marginTop: '0.25rem' }}>
        API команды: <span className="terminal-glow-cyan">info</span>, <span className="terminal-glow-cyan">project</span>, <span className="terminal-glow-cyan">license</span>
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
