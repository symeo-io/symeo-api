import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import { MongodbAdapterModule } from 'src/bootstrap/mongodb-adapter.module';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (configurationStoragePort: ConfigurationStoragePort) =>
    new ConfigurationService(configurationStoragePort),
  inject: ['MongodbConfigurationAdapter'],
};

@Module({
  imports: [MongodbAdapterModule],
  providers: [ConfigurationFacadeProvider],
  exports: [ConfigurationFacadeProvider],
})
export class DomainModule {}
