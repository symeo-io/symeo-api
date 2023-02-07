import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import { DynamodbAdapterModule } from 'src/bootstrap/dynamodb-adapter.module';
import GithubAdapterPort from '../domain/port/out/github.adapter.port';
import { GithubAdapterModule } from './github-adapter.module';
import { OrganizationService } from '../domain/service/organization.service';
import { RepositoryService } from 'src/domain/service/repository.service';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { SecretManagerAdapterModule } from 'src/bootstrap/secret-manager-adapter.module';
import { ValuesService } from 'src/domain/service/values.service';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    repositoryFacade: RepositoryFacade,
  ) => new ConfigurationService(configurationStoragePort, repositoryFacade),
  inject: ['DynamodbConfigurationAdapter', 'RepositoryFacade'],
};

const OrganizationFacadeProvider = {
  provide: 'OrganizationFacade',
  useFactory: (githubAdapterPort: GithubAdapterPort) =>
    new OrganizationService(githubAdapterPort),
  inject: ['GithubAdapter'],
};

const RepositoryFacadeProvider = {
  provide: 'RepositoryFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    configurationStoragePort: ConfigurationStoragePort,
  ) => new RepositoryService(githubAdapterPort, configurationStoragePort),
  inject: ['GithubAdapter', 'DynamodbConfigurationAdapter'],
};

const ValuesFacadeProvider = {
  provide: 'ValuesFacade',
  useFactory: (
    configurationFacade: ConfigurationFacade,
    secretValuesStoragePort: SecretValuesStoragePort,
  ) => new ValuesService(configurationFacade, secretValuesStoragePort),
  inject: ['ConfigurationFacade', 'SecretManagerAdapter'],
};

@Module({
  imports: [
    DynamodbAdapterModule,
    GithubAdapterModule,
    SecretManagerAdapterModule,
  ],
  providers: [
    ConfigurationFacadeProvider,
    OrganizationFacadeProvider,
    RepositoryFacadeProvider,
    ValuesFacadeProvider,
  ],
  exports: [
    ConfigurationFacadeProvider,
    OrganizationFacadeProvider,
    RepositoryFacadeProvider,
    ValuesFacadeProvider,
  ],
})
export class DomainModule {}
