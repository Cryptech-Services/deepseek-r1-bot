import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';
import { Thoughts } from './thoughts';

class Messages extends Model<
  InferAttributes<Messages>,
  InferCreationAttributes<Messages>
> {
  declare id: CreationOptional<number>;
  declare messageId: string;
  declare thoughtId: number;

  static associate() {
    Messages.belongsTo(Thoughts, {
      foreignKey: 'thoughtId',
      onDelete: 'CASCADE'
    });
  }
}

Messages.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    messageId: {
      type: new DataTypes.STRING(37),
      allowNull: false,
      unique: true
    },
    thoughtId: {
      type: new DataTypes.INTEGER(),
      allowNull: false,
      references: {
        model: 'thoughts',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    tableName: 'messages',
    sequelize: sequelize,
    underscored: true
  }
);

export { Messages };
