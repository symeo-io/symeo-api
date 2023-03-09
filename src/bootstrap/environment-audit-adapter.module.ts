import { Module } from '@nestjs/common';
import { PostgresAdapterModule } from 'src/bootstrap/postgres-adapter.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import EnvironmentAuditAdapter from 'src/infrastructure/audit-adapter/adapter/environment-audit.adapter';

const EnvironmentAuditAdapterProvider = {
  provide: 'EnvironmentAuditAdapter',
  useFactory: (
    environmentAuditRepository: Repository<EnvironmentAuditEntity>,
  ) => new EnvironmentAuditAdapter(environmentAuditRepository),
  inject: [getRepositoryToken(EnvironmentAuditEntity)],
};

@Module({
  imports: [PostgresAdapterModule],
  providers: [EnvironmentAuditAdapterProvider],
  exports: [EnvironmentAuditAdapterProvider],
})
export class EnvironmentAuditAdapterModule {}
