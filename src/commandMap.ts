import {
  ChatInputCommandInteraction,
  CacheType,
  ContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  AutocompleteInteraction
} from 'discord.js';

export const commandsList: any[] = [];
export const commandMap = new Map<
  string,
  {
    execute: (
      interaction:
        | ChatInputCommandInteraction<CacheType>
        | ContextMenuCommandInteraction<CacheType>
        | UserContextMenuCommandInteraction<CacheType>
        | MessageContextMenuCommandInteraction<CacheType>
    ) => Promise<void>;
    autocomplete?: (
      interaction: AutocompleteInteraction<CacheType>
    ) => Promise<void>;
  }
>();
