import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import { DynamodbAdapterModule } from 'src/bootstrap/dynamodb-adapter.module';
import GithubAdapterPort from '../domain/port/out/github.adapter.port';
import { RepositoryService } from '../domain/service/repository.service';
import { GithubAdapterModule } from './github-adapter.module';
import { OrganizationService } from '../domain/service/organization.service';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (configurationStoragePort: ConfigurationStoragePort) =>
    new ConfigurationService(configurationStoragePort),
  inject: ['DynamodbConfigurationAdapter'],
};

const RepositoryFacadeProvider = {
  provide: 'RepositoryFacade',
  useFactory: (githubAdapterPort: GithubAdapterPort) =>
    new RepositoryService(githubAdapterPort),
  inject: ['GithubAdapter'],
};

const OrganizationFacade = {
  provide: 'OrganizationFacade',
  useFactory: (githubAdapterPort: GithubAdapterPort) =>
    new OrganizationService(githubAdapterPort),
  inject: ['GithubAdapter'],
};

@Module({
  imports: [DynamodbAdapterModule, GithubAdapterModule],
  providers: [
    ConfigurationFacadeProvider,
    RepositoryFacadeProvider,
    OrganizationFacade,
  ],
  exports: [
    ConfigurationFacadeProvider,
    RepositoryFacadeProvider,
    OrganizationFacade,
  ],
})
export class DomainModule {}
