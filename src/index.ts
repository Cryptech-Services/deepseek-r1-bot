import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Logger from './util/logger';
import { Client, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { sequelize, Users } from './db';
import { runDbSeeders } from './db/seeders';
import { runDbMigrations } from './db/migrations';
import { commandsList, loadCommands } from './commands';
import { events, loadEvents } from './events';

const logger = new Logger('deepseek-r1', 'purple');
const loggerInit = logger.createSubLogger('init', 'orange');
const loggerSystem = logger.createSubLogger('sys', 'orange');

const defaultEnv = path.join(__dirname, '..', 'default.env');
const envExists = fs.existsSync(path.join(__dirname, '..', '.env'));
if (!envExists) {
  fs.copyFileSync(defaultEnv, path.join(__dirname, '..', '.env'));
  logger.warn('No .env file found, copied default.env to .env');
  process.exit(0);
}

dotenv.config();

const start = async () => {
  const pkg = require('../package.json');
  const name = pkg && pkg.name ? pkg.name : 'Unknown';
  const v = pkg && pkg.version ? pkg.version : 'Unknown';

  loggerInit.info(`Starting ${name} v${v}`);

  const rest = new REST().setToken(process.env.BOT_TOKEN as string);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
  });

  await sequelize.sync();

  await runDbSeeders();
  await runDbMigrations();

  loadEvents();
  for (const [name, eventHandlers] of events) {
    for (const event of eventHandlers) {
      if (event.once) {
        client.once(name, (...args) => event.execute(client, logger, ...args));
      } else {
        client.on(name, (...args) => event.execute(client, logger, ...args));
      }
    }
  }
  loadCommands();
  (async () => {
    try {
      loggerInit.debug(
        `Started refreshing ${commandsList.length} application (/) commands.`
      );

      const data: any = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        { body: commandsList }
      );

      loggerInit.debug(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      loggerInit.error((error as any).message ? (error as any).message : error);
    }
  })();

  await client.login(process.env.BOT_TOKEN as string);
  if (client.user) {
    await Users.findOrCreate({
      where: { discordId: client.user.id }
    });
  } else {
    throw new Error('Client user is undefined');
  }
  const handleShutdown = async (signal: string) => {
    loggerSystem.info(`Received ${signal}. Logging out...`);
    process.exit(0);
  };
  const handleError = async (error: Error) => {
    loggerSystem.error(
      `Error: ${error.message ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGUSR1', () => handleShutdown('SIGUSR1'));

  // Handle unexpected errors
  process.on('uncaughtException', handleError);
  process.on('unhandledRejection', (reason: any) =>
    handleError(new Error(reason))
  );
};

start();
