import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';
import { Users } from './users';

class ChannelMemories extends Model<
  InferAttributes<ChannelMemories>,
  InferCreationAttributes<ChannelMemories>
> {
  declare id: CreationOptional<number>;
  declare channelId: string;
  declare userId: number | null;
  declare role: 'user' | 'assistant';
  declare content: string;

  static associate() {
    ChannelMemories.belongsTo(Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  }
}

ChannelMemories.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    channelId: {
      type: new DataTypes.STRING(37),
      allowNull: false
    },
    userId: {
      type: new DataTypes.INTEGER(),
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role: {
      type: new DataTypes.ENUM('user', 'assistant'),
      allowNull: false
    },
    content: {
      type: new DataTypes.TEXT(),
      allowNull: false
    }
  },
  {
    timestamps: true,
    tableName: 'channel_memories',
    sequelize: sequelize,
    underscored: true
  }
);

export { ChannelMemories };
