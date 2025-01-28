import fs from 'fs';
import path from 'path';
import { commandsList, commandMap } from './commandMap';
import { Collection } from 'discord.js';
import Logger from './util/logger';

const logger = new Logger('deepseek-r1', 'purple');
const loggerInit = logger.createSubLogger('init', 'orange');
const cooldowns = new Collection<string, Collection<string, number>>();

const loadCommands = () => {
  const commandFolder = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandFolder);
  loggerInit.debug(`Loading ${commandFiles.length} commands...`);
  for (const file of commandFiles) {
    const commandPath = path.join(commandFolder, file);
    const command = require(commandPath).default;
    if (command && 'data' in command && 'execute' in command) {
      loggerInit.debug(`Loaded command '${command.data.name}'`);
      commandsList.push(command.data.toJSON());
      commandMap.set(command.data.name, {
        execute: command.execute,
        autocomplete: command.autocomplete
      });
    } else {
      loggerInit.warn(
        `The command at ${commandPath} is missing a required "data" or "execute" property.`
      );
    }
  }
  const menuFolder = path.join(__dirname, 'menu');
  const menuFolders = fs.readdirSync(menuFolder);
  for (const folder of menuFolders) {
    const menuPath = path.join(menuFolder, folder);
    const menuFiles = fs.readdirSync(menuPath);
    for (const file of menuFiles) {
      const menuFilePath = path.join(menuPath, file);
      const menu = require(menuFilePath).default;
      if (menu && 'data' in menu && 'execute' in menu) {
        loggerInit.debug(`Loaded menu ${folder}:'${menu.data.name}'`);
        commandsList.push(menu.data.toJSON());
        commandMap.set(`${folder}:${menu.data.name}`, {
          execute: menu.execute
        });
      } else {
        loggerInit.warn(
          `The menu at ${menuFilePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  for (const command of commandsList) {
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection<string, number>());
    }
  }
};

export { commandsList, commandMap, cooldowns, loadCommands };
