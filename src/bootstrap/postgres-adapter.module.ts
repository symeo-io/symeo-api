import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from 'src/infrastructure/postgres-adapter/ormconfig';
import PostgresConfigurationAdapter from 'src/infrastructure/postgres-adapter/adapter/postgres.configuration.adapter';
import { Repository } from 'typeorm';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import PostgresApiKeyAdapter from 'src/infrastructure/postgres-adapter/adapter/postgres.api-key.adapter';

const PostgresConfigurationAdapterProvider = {
  provide: 'PostgresConfigurationAdapter',
  useFactory: (configurationRepository: Repository<ConfigurationEntity>) =>
    new PostgresConfigurationAdapter(configurationRepository),
  inject: [getRepositoryToken(ConfigurationEntity)],
};

const PostgresApiKeyAdapterProvider = {
  provide: 'PostgresApiKeyAdapter',
  useFactory: (configurationRepository: Repository<ApiKeyEntity>) =>
    new PostgresApiKeyAdapter(configurationRepository),
  inject: [getRepositoryToken(ApiKeyEntity)],
};

const entities = [ConfigurationEntity, EnvironmentEntity, ApiKeyEntity];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: entities,
      migrations: [],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [
    PostgresConfigurationAdapterProvider,
    PostgresApiKeyAdapterProvider,
  ],
  exports: [
    PostgresConfigurationAdapterProvider,
    PostgresApiKeyAdapterProvider,
  ],
})
export class PostgresAdapterModule {}
