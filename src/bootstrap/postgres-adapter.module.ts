import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from 'src/infrastructure/postgres-adapter/ormconfig';
import PostgresConfigurationAdapter from 'src/infrastructure/postgres-adapter/adapter/postgres.configuration.adapter';
import { Repository } from 'typeorm';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import PostgresApiKeyAdapter from 'src/infrastructure/postgres-adapter/adapter/postgres.api-key.adapter';
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';
import { PostgresEnvironmentPermissionAdapter } from 'src/infrastructure/postgres-adapter/adapter/postgres.environment-permission.adapter';
import PostgresEnvironmentAdapter from 'src/infrastructure/postgres-adapter/adapter/postgres.environment.adapter';
import SdkValuesReadAnalyticsEntity from 'src/infrastructure/postgres-adapter/entity/analytics/sdk-values-read.analytics.entity';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import VcsAccessTokenEntity from '../infrastructure/postgres-adapter/entity/vcs/vcs-access-token.entity';
import { PostgresVcsAccessTokenAdapter } from '../infrastructure/postgres-adapter/adapter/postgres.vcs-access-token.adapter';

const PostgresConfigurationAdapterProvider = {
  provide: 'PostgresConfigurationAdapter',
  useFactory: (configurationRepository: Repository<ConfigurationEntity>) =>
    new PostgresConfigurationAdapter(configurationRepository),
  inject: [getRepositoryToken(ConfigurationEntity)],
};

const PostgresEnvironmentAdapterProvider = {
  provide: 'PostgresEnvironmentAdapter',
  useFactory: (environmentRepository: Repository<EnvironmentEntity>) =>
    new PostgresEnvironmentAdapter(environmentRepository),
  inject: [getRepositoryToken(EnvironmentEntity)],
};

const PostgresApiKeyAdapterProvider = {
  provide: 'PostgresApiKeyAdapter',
  useFactory: (configurationRepository: Repository<ApiKeyEntity>) =>
    new PostgresApiKeyAdapter(configurationRepository),
  inject: [getRepositoryToken(ApiKeyEntity)],
};

const PostgresEnvironmentPermissionAdapterProvider = {
  provide: 'PostgresEnvironmentPermissionAdapter',
  useFactory: (
    environmentPermissionRepository: Repository<EnvironmentPermissionEntity>,
  ) =>
    new PostgresEnvironmentPermissionAdapter(environmentPermissionRepository),
  inject: [getRepositoryToken(EnvironmentPermissionEntity)],
};

const PostgresVcsAccessTokenAdapterProvider = {
  provide: 'PostgresVcsAccessTokenAdapter',
  useFactory: (vcsAccessTokenRepository: Repository<VcsAccessTokenEntity>) =>
    new PostgresVcsAccessTokenAdapter(vcsAccessTokenRepository),
  inject: [getRepositoryToken(VcsAccessTokenEntity)],
};

const entities = [
  ConfigurationEntity,
  EnvironmentEntity,
  ApiKeyEntity,
  EnvironmentPermissionEntity,
  SdkValuesReadAnalyticsEntity,
  ConfigurationAuditEntity,
  EnvironmentAuditEntity,
  VcsAccessTokenEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: entities,
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [
    PostgresConfigurationAdapterProvider,
    PostgresApiKeyAdapterProvider,
    PostgresEnvironmentPermissionAdapterProvider,
    PostgresEnvironmentAdapterProvider,
    PostgresVcsAccessTokenAdapterProvider,
  ],
  exports: [
    PostgresConfigurationAdapterProvider,
    PostgresApiKeyAdapterProvider,
    PostgresEnvironmentPermissionAdapterProvider,
    PostgresEnvironmentAdapterProvider,
    PostgresVcsAccessTokenAdapterProvider,
    TypeOrmModule.forFeature(entities),
  ],
})
export class PostgresAdapterModule {}
