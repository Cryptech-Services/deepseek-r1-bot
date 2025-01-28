import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
  MessageFlags,
  TextChannel
} from 'discord.js';
import Logger from '../util/logger';
import { Users } from '../db';

const data = new SlashCommandBuilder()
  .setName('model')
  .setDescription(`Replies with information about the current model`);

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
  await reply.edit({
    content: `${process.env.MODEL} - ${process.env.MODEL_NAME}`
  });
};

const model = { data, execute };

export default model;
