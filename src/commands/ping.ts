import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
  MessageFlags,
  TextChannel
} from 'discord.js';
import Logger from '../util/logger';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(`Replies 'Pong!'`);

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
  await reply.edit('Pong!');
};

const ping = { data, execute };

export default ping;
