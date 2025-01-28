import fs from 'fs';

import { sequelize } from '..';
import { Migrations } from '../models/migrations';

import Logger from '../../util/logger';

const logger = new Logger('amm-volume-bot', 'purple');
const loggerDb = logger.createSubLogger('init', 'orange');
const loggerMigration = loggerDb.createSubLogger('db-migrations', 'green');

// FIXME: why don't/how the native migrations in sequelize work?
const runDbMigrations = async () => {
  let path = './dist/db/migrations';
  if (process.env.NODE_ENV !== 'production') {
    path = './src/db/migrations';
  }
  loggerMigration.debug(`using ${path} for migrations run!`);
  const files = fs.readdirSync(path);
  let runCount = 0;

  for (const file of files) {
    if (!file.endsWith('.js')) {
      continue;
    }
    if (file === 'index.ts') {
      continue;
    }
    const nt = file.split('-');
    if (nt[0].length === 14) {
      const t = nt[0];
      const n = nt.slice(1).join('-').replace('.js', '');

      const migration = await Migrations.findOne({ where: { nonce: t } });
      if (migration) {
        continue;
      }

      const migrate = require(`./${file}`).default;

      loggerMigration.info(`running migration up ${file}`);
      await migrate.up(sequelize.getQueryInterface(), sequelize);

      await Migrations.create({ name: n, nonce: t, complete: true });
      runCount++;
    } else {
      loggerMigration.warn(`skipping invalid migration ${file}`);
    }
  }
  if (runCount > 0) {
    loggerMigration.succ(`completed ${runCount} migration runs!`);
  }
};

export { runDbMigrations };
