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
      entities: ['dist/infrastructure/postgres-adapter/**/entity{.ts,.js}'],
      migrations: ['dist/migration/*.js'],
      synchronize: config.database.typeorm.synchronize,
    }),
  ],
})
export class PostgresAdapterModule {}
