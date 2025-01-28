import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';
import { Messages } from './messages';

class Thoughts extends Model<
  InferAttributes<Thoughts>,
  InferCreationAttributes<Thoughts>
> {
  declare id: CreationOptional<number>;
  declare content: string;

  static associate() {
    Thoughts.hasMany(Messages, {
      foreignKey: 'thoughtId',
      onDelete: 'CASCADE'
    });
  }
}

Thoughts.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
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
