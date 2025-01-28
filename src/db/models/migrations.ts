import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes
} from 'sequelize';
import { sequelize } from '..';

class Migrations extends Model<
  InferAttributes<Migrations>,
  InferCreationAttributes<Migrations>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare nonce: string;
  declare complete: boolean;
}

Migrations.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: new DataTypes.STRING(37),
      allowNull: false,
      unique: true
    },
    nonce: {
      type: new DataTypes.STRING(64),
      allowNull: false
    },
    complete: {
      type: new DataTypes.BOOLEAN(),
      defaultValue: false
    }
  },
  {
    timestamps: true,
    tableName: 'migrations',
    sequelize: sequelize,
    underscored: true
  }
);

export { Migrations };
