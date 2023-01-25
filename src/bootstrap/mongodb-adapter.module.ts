import { Module } from '@nestjs/common';
import MongodbConfigurationAdapter from 'src/infrastructure/mongodb-adapter/adapter/mongodb.configuration.adapter';
import ConfigurationRepository from 'src/infrastructure/mongodb-adapter/repository/configuration.repository';

const MongodbConfigurationAdapterProvider = {
  provide: 'MongodbConfigurationAdapter',
  useFactory: (configurationRepository: ConfigurationRepository) =>
    new MongodbConfigurationAdapter(configurationRepository),
  inject: ['ConfigurationRepository'],
};

const ConfigurationRepositoryProvider = {
  provide: 'ConfigurationRepository',
  useClass: ConfigurationRepository,
};

@Module({
  providers: [
    MongodbConfigurationAdapterProvider,
    ConfigurationRepositoryProvider,
  ],
  exports: [MongodbConfigurationAdapterProvider],
})
export class MongodbAdapterModule {}
