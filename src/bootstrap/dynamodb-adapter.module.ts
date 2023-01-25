import { Module } from '@nestjs/common';
import DynamodbConfigurationAdapter from 'src/infrastructure/dynamodb-adapter/adapter/dynamodb.configuration.adapter';
import ConfigurationRepository from 'src/infrastructure/dynamodb-adapter/repository/configuration.repository';

const DynamodbConfigurationAdapterProvider = {
  provide: 'DynamodbConfigurationAdapter',
  useFactory: (configurationRepository: ConfigurationRepository) =>
    new DynamodbConfigurationAdapter(configurationRepository),
  inject: ['ConfigurationRepository'],
};

const ConfigurationRepositoryProvider = {
  provide: 'ConfigurationRepository',
  useClass: ConfigurationRepository,
};

@Module({
  providers: [
    DynamodbConfigurationAdapterProvider,
    ConfigurationRepositoryProvider,
  ],
  exports: [DynamodbConfigurationAdapterProvider],
})
export class DynamodbAdapterModule {}
