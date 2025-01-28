import dotenv from 'dotenv';
import path from 'path';
import Logger from '../../util/logger';
dotenv.config();

const dbLogging = (process.env.DB_VERBOSE as string) == 'true';
const logger = new Logger('amm-volume-bot', 'purple');
const loggerDb = logger.createSubLogger('db', 'orange');

const config = {
  development: {
    storage: path.resolve('./data', 'database.sqlite'),
    dialect: 'sqlite',
    define: {
      timestamps: false
    },
    benchmark: dbLogging,
    logging: dbLogging
      ? (sql: string, timing?: number) => {
          loggerDb.debug(`${sql}${timing ? ` ${timing}ms` : ''}`);
        }
      : false
  },
  test:
    process.env.DB_DIALECT === 'sqlite'
      ? {
          storage: path.resolve('./data', 'database.sqlite'),
          dialect: 'sqlite',
          define: {
            timestamps: false
          },
          benchmark: dbLogging,
          logging: dbLogging
            ? (sql: string, timing?: number) => {
                loggerDb.debug(`${sql}${timing ? ` ${timing}ms` : ''}`);
              }
            : false
        }
      : {
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          host: process.env.DB_HOST,
          dialect: process.env.DB_DIALECT,
          define: {
            timestamps: false
          },
          benchmark: dbLogging,
          logging: dbLogging
            ? (sql: string, timing?: number) => {
                loggerDb.debug(`${sql}${timing ? ` ${timing}ms` : ''}`);
              }
            : false
        },
  production:
    process.env.DB_DIALECT === 'sqlite'
      ? {
          storage: path.resolve('./data', 'database.sqlite'),
          dialect: 'sqlite',
          define: {
            timestamps: false
          },
          logging: false
        }
      : {
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          host: process.env.DB_HOST,
          dialect: process.env.DB_DIALECT,
          define: {
            timestamps: false
          },
          logging: false
        }
};
export { config };
