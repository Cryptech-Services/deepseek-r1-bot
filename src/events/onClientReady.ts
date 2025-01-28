import fs from 'fs';
import path from 'path';
import { Client, Events } from 'discord.js';
import Logger from '../util/logger';

const icon = fs.readFileSync(
  path.join(__dirname, '..', '..', 'public', 'deepseek.png')
);

const onClientReady = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client<boolean>, logger: Logger) => {
    logger.debug(`Logged in as ${client.user?.tag}!`);
    if (process.env.OWNER_ID == undefined) {
      throw new Error('OWNER_ID is not defined in the .env file');
    }
    const owner = await client.users.fetch(process.env.OWNER_ID as string);
    if (!owner) {
      throw new Error('Failed to fetch owner');
    }

    const dm = await owner.createDM();
    if (dm) {
      logger.debug(`Created DM channel with owner ${owner.tag}`);
      await dm.send(`DeepSeek-R1 is online!`);
    } else {
      throw new Error('Failed to create DM channel with owner');
    }
    logger.info('Bot is ready!');
  }
};

export default onClientReady;
