import { Migrations } from './migrations';
import { Users } from './users';
import { UserMemories } from './user_memories';
import { ChannelMemories } from './channel_memories';
import { Thoughts } from './thoughts';
import { Messages } from './messages';

export const models = {
  Migrations,
  Users,
  UserMemories,
  ChannelMemories,
  Thoughts,
  Messages
};

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate();
  }
});

export { Migrations, Users, UserMemories, ChannelMemories, Thoughts, Messages };
