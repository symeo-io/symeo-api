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
import ConfigurationAuditService from 'src/domain/service/configuration-audit.service';
import ConfigurationAuditStoragePort from 'src/domain/port/out/configuration-audit.storage.port';
import { ConfigurationAuditAdapterModule } from 'src/bootstrap/configuration-audit-adapter.module';
import EnvironmentAuditService from 'src/domain/service/environment-audit.service';
import { EnvironmentAuditAdapterModule } from 'src/bootstrap/environment-audit-adapter.module';
import EnvironmentAuditStoragePort from 'src/domain/port/out/environment-audit.storage.port';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    repositoryFacade: RepositoryFacade,
    environmentPermissionFacade: EnvironmentPermissionFacade,
    secretValuesStoragePort: SecretValuesStoragePort,
    configurationAuditService: ConfigurationAuditService,
  ) =>
    new ConfigurationService(
      configurationStoragePort,
      repositoryFacade,
      environmentPermissionFacade,
      secretValuesStoragePort,
      configurationAuditService,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'RepositoryFacade',
    'EnvironmentPermissionFacade',
    'SecretManagerAdapter',
    'ConfigurationAuditService',
  ],
};

const EnvironmentFacadeProvider = {
  provide: 'EnvironmentFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    environmentStoragePort: EnvironmentStoragePort,
    secretValuesStoragePort: SecretValuesStoragePort,
    environmentAuditService: EnvironmentAuditService,
  ) =>
    new EnvironmentService(
      configurationStoragePort,
      environmentStoragePort,
      secretValuesStoragePort,
      environmentAuditService,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'PostgresEnvironmentAdapter',
    'SecretManagerAdapter',
    'EnvironmentAuditService',
  ],
};

const EnvironmentPermissionFacadeProvider = {
  provide: 'EnvironmentPermissionFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    environmentPermissionUtils: EnvironmentPermissionUtils,
    environmentAuditService: EnvironmentAuditService,
  ) =>
    new EnvironmentPermissionService(
      githubAdapterPort,
      environmentPermissionStoragePort,
      environmentPermissionUtils,
      environmentAuditService,
    ),
  inject: [
    'GithubAdapter',
    'PostgresEnvironmentPermissionAdapter',
    'EnvironmentPermissionUtils',
    'EnvironmentAuditService',
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
    environmentAuditService: EnvironmentAuditService,
  ) =>
    new ApiKeyService(
      configurationFacade,
      apiKeyStoragePort,
      environmentAuditService,
    ),
  inject: [
    'ConfigurationFacade',
    'PostgresApiKeyAdapter',
    'EnvironmentAuditService',
  ],
};

const ConfigurationAuditServiceProvider = {
  provide: 'ConfigurationAuditService',
  useFactory: (configurationAuditStoragePort: ConfigurationAuditStoragePort) =>
    new ConfigurationAuditService(configurationAuditStoragePort),
  inject: ['ConfigurationAuditAdapter'],
};

const EnvironmentAuditServiceProvider = {
  provide: 'EnvironmentAuditService',
  useFactory: (environmentAuditStoragePort: EnvironmentAuditStoragePort) =>
    new EnvironmentAuditService(environmentAuditStoragePort),
  inject: ['EnvironmentAuditAdapter'],
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
    ConfigurationAuditAdapterModule,
    EnvironmentAuditAdapterModule,
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
    ConfigurationAuditServiceProvider,
    EnvironmentAuditServiceProvider,
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
    ConfigurationAuditServiceProvider,
    EnvironmentAuditServiceProvider,
  ],
})
export class DomainModule {}
