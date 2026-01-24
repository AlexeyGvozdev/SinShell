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
      return <span className="text-red-500">{result.output}</span>;
    }
    
    return result.output;
  };

  const welcomeMessage = (
    <div className="mb-4">
      <div className="text-green-400 font-bold mb-2">
        Добро пожаловать в SinShell!
      </div>
      <div className="text-gray-400 mb-2">
        Введите <span className="text-cyan-400">help</span> для списка доступных команд.
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <Terminal 
        onCommand={handleCommand}
        welcomeMessage={welcomeMessage}
      />
    </main>
  );
}
