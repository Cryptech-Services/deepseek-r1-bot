import {
  ApplicationCommandType,
  CacheType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  MessageFlags,
  PermissionFlagsBits
} from 'discord.js';
import { Messages, Thoughts, Users } from '../../db';

const data = new ContextMenuCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
  .setName('Thoughts')
  .setType(ApplicationCommandType.Message);

const execute = async (
  interaction: MessageContextMenuCommandInteraction<CacheType>
) => {
  const reply = await interaction.deferReply({
    flags: [MessageFlags.Ephemeral]
  });
  const user = interaction.user.id;
  const messageId = interaction.targetId;
  const target = interaction.channel?.messages.cache.get(messageId)?.author.id;
  if (!target) {
    await reply.edit({
      content: 'You must use this command on a message.'
    });
    return;
  }
  const channel = interaction.channel;
  if (!channel) {
    await reply.edit({
      content: 'You must use this command in a channel.'
    });
    return;
  }

  const [botUser, created] = await Users.findOrCreate({
    where: { discordId: user },
    defaults: {
      discordId: user
    }
  });
  if (botUser.blacklisted) {
    await reply.edit({
      content: `I cannot proceed with an interaction with you <@${user}>. Please contact the administrator for more information.`
    });
    return;
  }

  if (interaction.client.user.id === target) {
    const message = await Messages.findOne({
      where: { messageId }
    });
    if (!message) {
      await reply.edit({
        content: 'I have no thoughts on this message.'
      });
      return;
    }
    const thoughts = await Thoughts.findOne({
      where: { id: message?.thoughtId }
    });
    if (!thoughts) {
      await reply.edit({
        content: 'I have no thoughts on this message.'
      });
      return;
    }

    if (thoughts.get().content.length > 2000) {
      // send the thought in DM with a link to the message in DM
      const dm = await interaction.user.createDM();
      await dm.send({
        content: `My thought process for ${channel.messages.cache.get(messageId)?.url}`,
        files: [
          {
            attachment: Buffer.from(thoughts.get().content),
            name: `${messageId}-thought.txt`
          }
        ]
      });
      await reply.edit({
        content: `My thought process for this message is too long to send here. I have sent it to you in DM.`
      });
    } else {
      await reply.edit({
        content: thoughts.get().content
      });
    }
    return;
  } else {
    await reply.edit({
      content: `This message was sent by <@${target}>. I only have a thought process for my own messages.`
    });
  }
};

const thoughts = { data, execute };

export default thoughts;
