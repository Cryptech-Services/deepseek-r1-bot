import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';
import { Users } from './users';

class UserMemories extends Model<
  InferAttributes<UserMemories>,
  InferCreationAttributes<UserMemories>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare role: 'user' | 'assistant';
  declare content: string;

  static associate() {
    UserMemories.belongsTo(Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  }
}

UserMemories.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: new DataTypes.INTEGER(),
      allowNull: false,
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
    tableName: 'user_memories',
    sequelize: sequelize,
    underscored: true
  }
);

export { UserMemories };
