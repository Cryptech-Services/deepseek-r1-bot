import { Client, DMChannel, Events, Message, TextChannel } from 'discord.js';
import Logger from '../util/logger';
import completion from '../util/completion';
import { Users, UserMemories, ChannelMemories } from '../db';
import { Op } from 'sequelize';
import { Thoughts, Messages } from '../db';

const onMessageCreate = {
  name: Events.MessageCreate,
  once: false,
  execute: async (
    client: Client<boolean>,
    logger: Logger,
    message: Message
  ) => {
    const normalizedMessage = message.content.replace(
      new RegExp(`<@${client.user?.id}>`, 'g'),
      'DeepSeek-R1'
    );

    if (normalizedMessage.length === 0) {
      return;
    }
    if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
      logger.debug(
        `Message received: "${normalizedMessage}" from ${message.author.tag} in ${message.guild ? `${message.guild.name} - ${(message.channel as TextChannel).name}` : 'DM'}`
      );
    }
    if (message.author.id === client.user?.id) return;
    try {
      if (message.author.id === client.user?.id) return;
      if (
        (message.mentions.has(client.user?.id as string) &&
          message.channel instanceof TextChannel) ||
        message.channel instanceof DMChannel
      ) {
        const [botUser, created] = await Users.findOrCreate({
          where: { discordId: message.author.id }
        });

        if (botUser.blacklisted) {
          message.reply({
            content: `I cannot proceed with an interaction with you <@${message.author.id}>. Please contact the administrator for more information.`
          });
          return;
        }

        // Get the last 10 messages from the channel or DM
        const memories =
          message.channel instanceof DMChannel
            ? await UserMemories.findAll({
                where: { userId: botUser.id },
                order: [['createdAt', 'ASC']],
                limit: 20
              })
            : await ChannelMemories.findAll({
                where: {
                  channelId: message.channel.id,
                  userId: { [Op.or]: [botUser.id, null] }
                },
                order: [['createdAt', 'ASC']],
                limit: 20
              });

        const lastMessages = memories.map((memory) => {
          return {
            role: memory.get().role,
            content: memory.get().content
          };
        });

        await message.channel.sendTyping();
        const response = await completion(normalizedMessage, lastMessages);
        if (response.length == 0) {
          return;
        }

        if (message.channel instanceof DMChannel) {
          await UserMemories.create({
            userId: botUser.id,
            role: 'user',
            content: normalizedMessage
          });
        } else {
          await ChannelMemories.create({
            channelId: message.channel.id,
            role: 'user',
            content: normalizedMessage
          });
        }
        const thinking = (
          response.match(/<think>([\s\S]*?)<\/think>/g) || []
        ).map((thought) => thought.replace(/<think>|<\/think>/g, '').trim());
        const text = response.replace(/<think>([\s\S]*?)<\/think>/g, '').trim();
        if (message.channel instanceof DMChannel) {
          await UserMemories.create({
            userId: botUser.id,
            role: 'assistant',
            content: text
          });
        } else {
          await ChannelMemories.create({
            channelId: message.channel.id,
            role: 'assistant',
            content: text.trim()
          });
        }

        const messageIds: string[] = [];
        if (text.length + 4 > 2000) {
          const splitText = text.split('\n');
          let currentMessage = '';
          console.log(JSON.stringify(splitText, null, 2));
          for (let i = 0; i < splitText.length; i++) {
            if (currentMessage.length + splitText[i].length + 4 > 2000) {
              await message.channel.sendTyping();
              const reply = await message.reply(currentMessage);
              messageIds.push(reply.id);
              currentMessage = '';
            }
            currentMessage += splitText[i] + '\n';
          }
          if (currentMessage.length > 0) {
            await message.channel.sendTyping();
            const reply = await message.reply(currentMessage);
            messageIds.push(reply.id);
          }
        } else {
          await message.channel.sendTyping();
          const reply = await message.reply(text);
          messageIds.push(reply.id);
        }
        for (const messageId of messageIds) {
          const thoughtProcess = thinking.join('\n').trim();
          const thought = await Thoughts.create({
            content:
              thoughtProcess.length > 0
                ? thoughtProcess
                : 'No thinking was required to answer this message.'
          });
          await Messages.findOrCreate({
            where: { messageId },
            defaults: {
              messageId,
              thoughtId: thought.id
            }
          });
        }
        if (message.channel instanceof DMChannel) {
          const userMemories = await UserMemories.count({
            where: { userId: botUser.id }
          });
          if (userMemories > 20) {
            const memories = await UserMemories.findAll({
              where: { userId: botUser.id },
              order: [['createdAt', 'ASC']],
              limit: userMemories - 20
            });
            for (const memory of memories) {
              await memory.destroy();
            }
          }
        } else {
          const channelMemories = await ChannelMemories.count({
            where: { channelId: message.channel.id }
          });
          if (channelMemories >= 20) {
            const memories = await ChannelMemories.findAll({
              where: { channelId: message.channel.id },
              order: [['createdAt', 'ASC']],
              limit: channelMemories - 20
            });
            for (const memory of memories) {
              await memory.destroy();
            }
          }
        }
      }
    } catch (e) {
      logger.error((e as any).message ? (e as any).message : 'Unknown error');
    }
  }
};

export default onMessageCreate;
