import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'symeo-js/config';

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: config.database.typeorm.host,
  port: config.database.typeorm.port,
  username: config.database.typeorm.username,
  password: config.database.typeorm.password,
  database: config.database.typeorm.database,
  migrations: ['migrations/*.ts'],
  synchronize: config.database.typeorm.synchronize,
};

export default new DataSource(ormConfig);
