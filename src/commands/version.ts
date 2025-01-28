import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
  MessageFlags,
  TextChannel
} from 'discord.js';
import Logger from '../util/logger';
import { Users } from '../db';
const pkg = require('../../package.json');
const name = pkg && pkg.name ? pkg.name : 'Unknown';

const data = new SlashCommandBuilder()
  .setName('version')
  .setDescription(`Replies with the current version of the bot`);

const execute = async (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
    const logger = new Logger('deepseek-r1', 'purple');
    logger.debug(
      `Received command: ${interaction.commandName} from ${interaction.user.id} in ${interaction.guild ? `${interaction.guild.name} - ${(interaction.channel as TextChannel).name}` : 'DM'}`
    );
  }
  const reply = await interaction.deferReply({
    flags: [MessageFlags.Ephemeral]
  });
  const [botUser, created] = await Users.findOrCreate({
    where: { discordId: interaction.user.id }
  });

  if (botUser.blacklisted) {
    await reply.edit({
      content: `I cannot proceed with an interaction with you <@${interaction.user.id}>. Please contact the administrator for more information.`
    });
    return;
  }
  const version = pkg && pkg.version ? pkg.version : 'Unknown';
  reply.edit({
    content: `${name} v${version}`
  });
};

const version = { data, execute };

export default version;
