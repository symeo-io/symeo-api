import { config } from 'symeo-js/config';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const ormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: config.database.typeorm.host,
  port: config.database.typeorm.port,
  username: config.database.typeorm.username,
  password: config.database.typeorm.password,
  database: config.database.typeorm.database,
  migrations: [join(__dirname, 'migrations/*.js')],
  synchronize: config.database.typeorm.synchronize,
  migrationsRun: config.database.typeorm.migrationsRun,
};
