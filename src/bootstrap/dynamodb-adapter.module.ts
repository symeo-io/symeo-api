import { Module } from '@nestjs/common';
import DynamodbConfigurationAdapter from 'src/infrastructure/dynamodb-adapter/adapter/dynamodb.configuration.adapter';
import ConfigurationRepository from 'src/infrastructure/dynamodb-adapter/repository/configuration.repository';
import { DynamoDBClient } from 'src/infrastructure/dynamodb-adapter/dynamodb.client';
import ApiKeyRepository from 'src/infrastructure/dynamodb-adapter/repository/api-key.repository';
import DynamodbApiKeyAdapter from 'src/infrastructure/dynamodb-adapter/adapter/dynamodb.api-key.adapter';

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

const DynamodbApiKeyAdapterProvider = {
  provide: 'DynamodbApiKeyAdapter',
  useFactory: (configurationRepository: ApiKeyRepository) =>
    new DynamodbApiKeyAdapter(configurationRepository),
  inject: ['ApiKeyRepository'],
};

const ApiKeyRepositoryProvider = {
  provide: 'ApiKeyRepository',
  useFactory: (dynamoDBClient: DynamoDBClient) =>
    new ApiKeyRepository(dynamoDBClient),
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
    DynamodbApiKeyAdapterProvider,
    ApiKeyRepositoryProvider,
    DynamoDBClientProvider,
  ],
  exports: [
    DynamodbConfigurationAdapterProvider,
    DynamodbApiKeyAdapterProvider,
  ],
})
export class DynamodbAdapterModule {}
