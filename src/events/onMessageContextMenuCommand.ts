import {
  BitField,
  CacheType,
  Client,
  Events,
  MessageContextMenuCommandInteraction,
  MessageFlags
} from 'discord.js';
import Logger from '../util/logger';
import { commandMap } from '../commandMap';

const onMessageContextMenuCommand = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (
    client: Client<boolean>, //eslint-disable-line @typescript-eslint/no-unused-vars
    logger: Logger, //eslint-disable-line @typescript-eslint/no-unused-vars
    interaction: MessageContextMenuCommandInteraction<CacheType>
  ) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    const command = commandMap.get(`message:${interaction.commandName}`);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (e) {
      logger.error((e as any).message ? (e as any).message : 'Unknown error');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          flags: [MessageFlags.Ephemeral]
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          flags: [MessageFlags.Ephemeral]
        });
      }
    }
  }
};

export default onMessageContextMenuCommand;
