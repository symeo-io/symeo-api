import { Module } from '@nestjs/common';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import ConfigurationService from 'src/domain/service/configuration.service';
import GithubAdapterPort from '../domain/port/out/github.adapter.port';
import { GithubAdapterModule } from './github-adapter.module';
import { OrganizationService } from '../domain/service/organization.service';
import { RepositoryService } from 'src/domain/service/repository.service';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { SecretManagerAdapterModule } from 'src/bootstrap/secret-manager-adapter.module';
import { ValuesService } from 'src/domain/service/values.service';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import { EnvironmentService } from 'src/domain/service/environment.service';
import { ApiKeyService } from 'src/domain/service/api-key.service';
import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import { PostgresAdapterModule } from 'src/bootstrap/postgres-adapter.module';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import { EnvironmentPermissionService } from 'src/domain/service/environment-permission.service';
import { AuthorizationService } from 'src/domain/service/authorization.service';
import EnvironmentStoragePort from 'src/domain/port/out/environment.storage.port';
import { PermissionRoleService } from 'src/domain/service/permission-role.service';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    repositoryFacade: RepositoryFacade,
    environmentPermissionFacade: EnvironmentPermissionFacade,
    secretValuesStoragePort: SecretValuesStoragePort,
  ) =>
    new ConfigurationService(
      configurationStoragePort,
      repositoryFacade,
      environmentPermissionFacade,
      secretValuesStoragePort,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'RepositoryFacade',
    'EnvironmentPermissionFacade',
    'SecretManagerAdapter',
  ],
};

const EnvironmentFacadeProvider = {
  provide: 'EnvironmentFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    environmentStoragePort: EnvironmentStoragePort,
    secretValuesStoragePort: SecretValuesStoragePort,
  ) =>
    new EnvironmentService(
      configurationStoragePort,
      environmentStoragePort,
      secretValuesStoragePort,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'PostgresEnvironmentAdapter',
    'SecretManagerAdapter',
  ],
};

const EnvironmentPermissionFacadeProvider = {
  provide: 'EnvironmentPermissionFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    environmentPermissionUtils: EnvironmentPermissionUtils,
  ) =>
    new EnvironmentPermissionService(
      githubAdapterPort,
      environmentPermissionStoragePort,
      environmentPermissionUtils,
    ),
  inject: [
    'GithubAdapter',
    'PostgresEnvironmentPermissionAdapter',
    'EnvironmentPermissionUtils',
  ],
};

const AuthorizationServiceProvider = {
  provide: 'AuthorizationService',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    configurationStoragePort: ConfigurationStoragePort,
    apiKeyStoragePort: ApiKeyStoragePort,
    permissionRoleService: PermissionRoleService,
  ) =>
    new AuthorizationService(
      githubAdapterPort,
      configurationStoragePort,
      apiKeyStoragePort,
      permissionRoleService,
    ),
  inject: [
    'GithubAdapter',
    'PostgresConfigurationAdapter',
    'PostgresApiKeyAdapter',
    'PermissionRoleService',
  ],
};

const PermissionRoleServiceProvider = {
  provide: 'PermissionRoleService',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    environmentPermissionUtils: EnvironmentPermissionUtils,
  ) =>
    new PermissionRoleService(
      githubAdapterPort,
      environmentPermissionStoragePort,
      environmentPermissionUtils,
    ),
  inject: [
    'GithubAdapter',
    'PostgresEnvironmentPermissionAdapter',
    'EnvironmentPermissionUtils',
  ],
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
  inject: ['GithubAdapter', 'PostgresConfigurationAdapter'],
};

const ValuesFacadeProvider = {
  provide: 'ValuesFacade',
  useFactory: (
    secretValuesStoragePort: SecretValuesStoragePort,
    configurationFacade: ConfigurationFacade,
    environmentPermissionFacade: EnvironmentPermissionFacade,
  ) =>
    new ValuesService(
      secretValuesStoragePort,
      configurationFacade,
      environmentPermissionFacade,
    ),
  inject: [
    'SecretManagerAdapter',
    'ConfigurationFacade',
    'EnvironmentPermissionFacade',
  ],
};

const ApiKeyFacadeProvider = {
  provide: 'ApiKeyFacade',
  useFactory: (
    configurationFacade: ConfigurationFacade,
    apiKeyStoragePort: ApiKeyStoragePort,
  ) => new ApiKeyService(configurationFacade, apiKeyStoragePort),
  inject: ['ConfigurationFacade', 'PostgresApiKeyAdapter'],
};

const EnvironmentPermissionUtilsProvider = {
  provide: 'EnvironmentPermissionUtils',
  useValue: new EnvironmentPermissionUtils(),
};

@Module({
  imports: [
    PostgresAdapterModule,
    GithubAdapterModule,
    SecretManagerAdapterModule,
  ],
  providers: [
    ConfigurationFacadeProvider,
    EnvironmentFacadeProvider,
    OrganizationFacadeProvider,
    RepositoryFacadeProvider,
    ValuesFacadeProvider,
    ApiKeyFacadeProvider,
    EnvironmentPermissionFacadeProvider,
    EnvironmentPermissionUtilsProvider,
    AuthorizationServiceProvider,
    PermissionRoleServiceProvider,
  ],
  exports: [
    ConfigurationFacadeProvider,
    EnvironmentFacadeProvider,
    OrganizationFacadeProvider,
    RepositoryFacadeProvider,
    ValuesFacadeProvider,
    ApiKeyFacadeProvider,
    EnvironmentPermissionFacadeProvider,
    AuthorizationServiceProvider,
    PermissionRoleServiceProvider,
  ],
})
export class DomainModule {}
