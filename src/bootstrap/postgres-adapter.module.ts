import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from 'src/infrastructure/postgres-adapter/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig)],
})
export class PostgresAdapterModule {}
