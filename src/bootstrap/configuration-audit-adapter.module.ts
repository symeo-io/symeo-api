import { Module } from '@nestjs/common';
import { PostgresAdapterModule } from 'src/bootstrap/postgres-adapter.module';
import { Repository } from 'typeorm';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import ConfigurationAuditAdapter from 'src/infrastructure/audit-adapter/adapter/configuration-audit.adapter';
import { getRepositoryToken } from '@nestjs/typeorm';

const ConfigurationAuditAdapterProvider = {
  provide: 'ConfigurationAuditAdapter',
  useFactory: (
    configurationAuditRepository: Repository<ConfigurationAuditEntity>,
  ) => new ConfigurationAuditAdapter(configurationAuditRepository),
  inject: [getRepositoryToken(ConfigurationAuditEntity)],
};

@Module({
  imports: [PostgresAdapterModule],
  providers: [ConfigurationAuditAdapterProvider],
  exports: [ConfigurationAuditAdapterProvider],
})
export class ConfigurationAuditAdapterModule {}
