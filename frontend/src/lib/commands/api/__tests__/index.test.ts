/**
 * Тесты для API команд индекса
 */

import {
  // Health команды
  healthCommand,
  healthDetailedCommand,
  readyCommand,
  liveCommand,
  pingCommand,
  
  // Info команды
  infoCommand,
  apiInfoCommand,
  serverStatusCommand,
  apiRootCommand,
  
  // About команды
  aboutApiCommand,
  aboutExtendedCommand,
  licenseCommand,
  projectCommand,
  
  // Список всех команд
  apiCommands,
} from '../index';

describe('API Commands Index', () => {
  describe('exports', () => {
    it('должен экспортировать все health команды', () => {
      expect(healthCommand).toBeDefined();
      expect(healthDetailedCommand).toBeDefined();
      expect(readyCommand).toBeDefined();
      expect(liveCommand).toBeDefined();
      expect(pingCommand).toBeDefined();
    });

    it('должен экспортировать все info команды', () => {
      expect(infoCommand).toBeDefined();
      expect(apiInfoCommand).toBeDefined();
      expect(serverStatusCommand).toBeDefined();
      expect(apiRootCommand).toBeDefined();
    });

    it('должен экспортировать все about команды', () => {
      expect(aboutApiCommand).toBeDefined();
      expect(aboutExtendedCommand).toBeDefined();
      expect(licenseCommand).toBeDefined();
      expect(projectCommand).toBeDefined();
    });
  });

  describe('apiCommands array', () => {
    it('должен содержать все API команды', () => {
      expect(apiCommands).toHaveLength(13);
    });

    it('должен содержать health команды в правильном порядке', () => {
      expect(apiCommands[0]).toBe(healthCommand);
      expect(apiCommands[1]).toBe(healthDetailedCommand);
      expect(apiCommands[2]).toBe(readyCommand);
      expect(apiCommands[3]).toBe(liveCommand);
      expect(apiCommands[4]).toBe(pingCommand);
    });

    it('должен содержать info команды в правильном порядке', () => {
      expect(apiCommands[5]).toBe(infoCommand);
      expect(apiCommands[6]).toBe(apiInfoCommand);
      expect(apiCommands[7]).toBe(serverStatusCommand);
      expect(apiCommands[8]).toBe(apiRootCommand);
    });

    it('должен содержать about команды в правильном порядке', () => {
      expect(apiCommands[9]).toBe(aboutApiCommand);
      expect(apiCommands[10]).toBe(aboutExtendedCommand);
      expect(apiCommands[11]).toBe(licenseCommand);
      expect(apiCommands[12]).toBe(projectCommand);
    });

    it('должен содержать уникальные команды', () => {
      const uniqueCommands = [...new Set(apiCommands)];
      expect(uniqueCommands).toHaveLength(apiCommands.length);
    });

    it('все команды должны иметь обязательные свойства', () => {
      apiCommands.forEach(command => {
        expect(command).toHaveProperty('name');
        expect(command).toHaveProperty('description');
        expect(command).toHaveProperty('usage');
        expect(command).toHaveProperty('execute');
        expect(typeof command.execute).toBe('function');
      });
    });

    it('все команды должны иметь уникальные имена', () => {
      const commandNames = apiCommands.map(cmd => cmd.name);
      const uniqueNames = [...new Set(commandNames)];
      expect(uniqueNames).toHaveLength(commandNames.length);
    });
  });

  describe('command structure validation', () => {
    it('health команды должны иметь правильную структуру', () => {
      expect(healthCommand.name).toBe('health');
      expect(healthDetailedCommand.name).toBe('health-detailed');
      expect(readyCommand.name).toBe('ready');
      expect(liveCommand.name).toBe('live');
      expect(pingCommand.name).toBe('ping');
    });

    it('info команды должны иметь правильную структуру', () => {
      expect(infoCommand.name).toBe('info');
      expect(apiInfoCommand.name).toBe('api-info');
      expect(serverStatusCommand.name).toBe('server-status');
      expect(apiRootCommand.name).toBe('api');
    });

    it('about команды должны иметь правильную структуру', () => {
      expect(aboutApiCommand.name).toBe('about-api');
      expect(aboutExtendedCommand.name).toBe('about-extended');
      expect(licenseCommand.name).toBe('license');
      expect(projectCommand.name).toBe('project');
    });
  });
});