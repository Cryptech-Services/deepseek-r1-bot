import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';
import { UserMemories } from './user_memories';
import { ChannelMemories } from './channel_memories';

class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare id: CreationOptional<number>;
  declare discordId: string;
  declare blacklisted: CreationOptional<boolean>;

  static associate() {
    Users.hasMany(UserMemories, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    Users.hasMany(ChannelMemories, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    discordId: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    blacklisted: {
      type: new DataTypes.BOOLEAN(),
      defaultValue: false
    }
  },
  {
    timestamps: true,
    tableName: 'users',
    sequelize: sequelize,
    underscored: true
  }
);

export { Users };
