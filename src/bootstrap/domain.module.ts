import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import { DynamodbAdapterModule } from 'src/bootstrap/dynamodb-adapter.module';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (configurationStoragePort: ConfigurationStoragePort) =>
    new ConfigurationService(configurationStoragePort),
  inject: ['DynamodbConfigurationAdapter'],
};

@Module({
  imports: [DynamodbAdapterModule],
  providers: [ConfigurationFacadeProvider],
  exports: [ConfigurationFacadeProvider],
})
export class DomainModule {}
