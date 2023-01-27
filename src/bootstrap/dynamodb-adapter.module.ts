import { Module } from '@nestjs/common';
import DynamodbConfigurationAdapter from 'src/infrastructure/dynamodb-adapter/adapter/dynamodb.configuration.adapter';
import ConfigurationRepository from 'src/infrastructure/dynamodb-adapter/repository/configuration.repository';
import { DynamoDBClient } from 'src/infrastructure/dynamodb-adapter/dynamodb.client';

const DynamodbConfigurationAdapterProvider = {
  provide: 'DynamodbConfigurationAdapter',
  useFactory: (configurationRepository: ConfigurationRepository) =>
    new DynamodbConfigurationAdapter(configurationRepository),
  inject: ['ConfigurationRepository'],
};

const ConfigurationRepositoryProvider = {
  provide: 'ConfigurationRepository',
  useFactory: (dynamoDBClient: DynamoDBClient) =>
    new ConfigurationRepository(dynamoDBClient),
  inject: ['DynamoDBClient'],
};

const DynamoDBClientProvider = {
  provide: 'DynamoDBClient',
  useClass: DynamoDBClient,
};

@Module({
  providers: [
    DynamodbConfigurationAdapterProvider,
    ConfigurationRepositoryProvider,
    DynamoDBClientProvider,
  ],
  exports: [DynamodbConfigurationAdapterProvider],
})
export class DynamodbAdapterModule {}
