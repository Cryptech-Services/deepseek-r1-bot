import { Options, Sequelize } from 'sequelize';
import { config } from '../db/config/config';

const conf = config[
  process.env.NODE_ENV as 'development' | 'test' | 'production'
]
  ? config[process.env.NODE_ENV as 'development' | 'test' | 'production']
  : {};

export const sequelize = new Sequelize(conf as Options);

const setup = async () => {
  await sequelize.authenticate();
  if (sequelize.getDialect() === 'sqlite') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [results, meta] = await sequelize.query('PRAGMA foreign_keys');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (results && (results as any).foreign_keys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((results as any).foreign_keys === 0) {
        await sequelize.query('PRAGMA foreign_keys = ON');
      }
    }
  }
  await sequelize.sync({ alter: false });
};

setup();

export * from './models';
