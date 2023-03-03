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

const entities = [
  ConfigurationEntity,
  EnvironmentEntity,
  ApiKeyEntity,
  EnvironmentPermissionEntity,
  SdkValuesReadAnalyticsEntity,
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
  ],
  exports: [
    PostgresConfigurationAdapterProvider,
    PostgresApiKeyAdapterProvider,
    PostgresEnvironmentPermissionAdapterProvider,
    PostgresEnvironmentAdapterProvider,
    TypeOrmModule.forFeature(entities),
  ],
})
export class PostgresAdapterModule {}
