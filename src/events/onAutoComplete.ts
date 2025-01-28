import { AutocompleteInteraction, CacheType, Client, Events } from 'discord.js';
import Logger from '../util/logger';
import { commandMap } from '../commandMap';

const onAutoComplete = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (
    client: Client<boolean>, //eslint-disable-line @typescript-eslint/no-unused-vars
    logger: Logger, //eslint-disable-line @typescript-eslint/no-unused-vars
    interaction: AutocompleteInteraction<CacheType>
  ) => {
    if (!interaction.isAutocomplete()) return;
    const command = commandMap.get(interaction.commandName);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
    if (command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logger.error(
          (error as any).message ? (error as any).message : 'Unknown error'
        );
      }
    }
  }
};

export default onAutoComplete;
