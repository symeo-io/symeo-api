import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import { DynamodbAdapterModule } from 'src/bootstrap/dynamodb-adapter.module';
import GithubAdapterPort from '../domain/port/out/github.adapter.port';
import { GithubAdapterModule } from './github-adapter.module';
import { OrganizationService } from '../domain/service/organization.service';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (configurationStoragePort: ConfigurationStoragePort) =>
    new ConfigurationService(configurationStoragePort),
  inject: ['DynamodbConfigurationAdapter'],
};

const OrganizationFacade = {
  provide: 'OrganizationFacade',
  useFactory: (githubAdapterPort: GithubAdapterPort) =>
    new OrganizationService(githubAdapterPort),
  inject: ['GithubAdapter'],
};

@Module({
  imports: [DynamodbAdapterModule, GithubAdapterModule],
  providers: [ConfigurationFacadeProvider, OrganizationFacade],
  exports: [ConfigurationFacadeProvider, OrganizationFacade],
})
export class DomainModule {}
