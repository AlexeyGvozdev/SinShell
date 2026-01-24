/**
 * API команды для взаимодействия с backend
 */

// Health команды
export {
  healthCommand,
  healthDetailedCommand,
  readyCommand,
  liveCommand,
  pingCommand,
} from './health';

// Info команды
export {
  infoCommand,
  apiInfoCommand,
  serverStatusCommand,
  apiRootCommand,
} from './info';

// About команды
export {
  aboutApiCommand,
  aboutExtendedCommand,
  licenseCommand,
  projectCommand,
} from './about';

// Импортируем все команды для списка
import {
  healthCommand,
  healthDetailedCommand,
  readyCommand,
  liveCommand,
  pingCommand,
} from './health';

import {
  infoCommand,
  apiInfoCommand,
  serverStatusCommand,
  apiRootCommand,
} from './info';

import {
  aboutApiCommand,
  aboutExtendedCommand,
  licenseCommand,
  projectCommand,
} from './about';

// Список всех API команд для удобной регистрации
export const apiCommands = [
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
];