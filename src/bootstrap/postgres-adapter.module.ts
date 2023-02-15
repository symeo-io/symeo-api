import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'symeo-js/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.typeorm.host,
      port: config.database.typeorm.port,
      username: config.database.typeorm.username,
      password: config.database.typeorm.password,
      database: config.database.typeorm.database,
      entities: [config.database.typeorm.entities],
      migrations: [config.database.typeorm.migrations],
      synchronize: config.database.typeorm.synchronize,
    }),
  ],
})
export class PostgresAdapterModule {}
