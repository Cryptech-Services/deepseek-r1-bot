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
  .setName('blacklist')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Blacklist a user')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to blacklist')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('remove')
      .setDescription('Remove a user from the blacklist')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to remove from the blacklist')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('list').setDescription('List all blacklisted users')
  )
  .setDescription('Modify or view the blacklist');

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
  const subcommand = interaction.options.getSubcommand();
  const discordUser = interaction.options.getUser('user');

  const [botUser, created] = await Users.findOrCreate({
    where: { discordId: interaction.user.id }
  });

  if (botUser.blacklisted) {
    await reply.edit({
      content: `I cannot proceed with an interaction with you <@${interaction.user.id}>. Please contact the administrator for more information.`
    });
    return;
  }

  if (interaction.user.id !== process.env.OWNER_ID) {
    return reply.edit({
      content: 'You do not have permission to use this command'
    });
  }

  switch (subcommand) {
    case 'add': {
      if (!discordUser) {
        return reply.edit({
          content: 'Invalid user provided'
        });
      }
      const [user, created] = await Users.findOrCreate({
        where: { discordId: discordUser.id }
      });
      if (user.blacklisted) {
        return reply.edit({
          content: 'User is already blacklisted'
        });
      }
      if (discordUser.id === interaction.user.id) {
        return reply.edit({
          content: 'You cannot blacklist yourself'
        });
      }
      if (discordUser.id === interaction.client.user?.id) {
        return reply.edit({
          content: 'You cannot blacklist me'
        });
      }
      if (discordUser.id === process.env.OWNER_ID) {
        return reply.edit({
          content: 'You cannot blacklist the owner'
        });
      }
      await user.update({ blacklisted: true });
      return reply.edit({
        content: `User <@${discordUser.id}> added to blacklist`
      });
    }

    case 'remove': {
      if (!discordUser) {
        return reply.edit({
          content: 'Invalid user provided'
        });
      }
      const [user, created] = await Users.findOrCreate({
        where: { discordId: discordUser.id }
      });
      if (!user.blacklisted) {
        return reply.edit({
          content: 'User is not blacklisted'
        });
      }
      await user.update({ blacklisted: false });
      return reply.edit({
        content: `User <@${discordUser.id}> removed from blacklist`
      });
    }

    case 'list': {
      const blacklistedUsers = await Users.findAll({
        where: { blacklisted: true }
      });
      const userList = blacklistedUsers.map((u) => `<@${u.discordId}>`);
      if (userList.length === 0) {
        return reply.edit({
          content: 'No blacklisted users'
        });
      }
      return reply.edit({
        content: `Blacklisted users: ${userList.join(', ')}`
      });
    }
    default:
      return reply.edit({
        content: 'Invalid subcommand provided'
      });
  }
};

const blacklist = { data, execute };

export default blacklist;
