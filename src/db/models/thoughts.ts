import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';

class Thoughts extends Model<
  InferAttributes<Thoughts>,
  InferCreationAttributes<Thoughts>
> {
  declare id: CreationOptional<number>;
  declare messageId: string;
  declare thought: string;
}

Thoughts.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    messageId: {
      type: new DataTypes.STRING(37),
      allowNull: false
    },
    thought: {
      type: new DataTypes.TEXT(),
      allowNull: false
    }
  },
  {
    timestamps: true,
    tableName: 'thoughts',
    sequelize: sequelize,
    underscored: true
  }
);

export { Thoughts };
