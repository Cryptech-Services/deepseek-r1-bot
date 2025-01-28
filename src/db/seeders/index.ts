import fs from 'fs';

import { sequelize } from '..';
import { Migrations } from '../models/migrations';

import Logger from '../../util/logger';

const logger = new Logger('amm-volume-bot', 'purple');
const loggerDb = logger.createSubLogger('init', 'orange');
const loggerSeeder = loggerDb.createSubLogger('db-seeder', 'green');

// FIXME: why don't the native seeders in sequelize work?
const runDbSeeders = async () => {
  let path = './dist/db/seeders';
  if (process.env.NODE_ENV !== 'production') {
    path = './src/db/seeders';
  }
  loggerSeeder.debug(`using ${path} for seeders run!`);
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
      const _migration = await Migrations.findOne({ where: { nonce: t } });
      if (_migration) {
        const migration = _migration.get();
        if (!migration.complete) {
          const migrate = require(`./${file}`).default;
          loggerSeeder.info(`running seeder down ${file}`);
          await migrate.down(sequelize.getQueryInterface(), sequelize);
        }
        continue;
      }

      const migrate = require(`./${file}`).default;

      loggerSeeder.info(`running seeder up ${file}`);
      await migrate.up(sequelize.getQueryInterface(), sequelize);

      await Migrations.create({ name: n, nonce: t, complete: true });
      runCount++;
    } else {
      loggerSeeder.warn(`skipping invalid seeder ${file}`);
    }
  }
  if (runCount > 0) {
    loggerSeeder.succ(`completed ${runCount} seed runs!`);
  }
};

export { runDbSeeders };
