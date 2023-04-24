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
import ConfigurationAuditFacade from 'src/domain/port/in/configuration-audit.facade.port';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';
import { ValuesVersionService } from 'src/domain/service/values-version.service';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import { GitlabAdapterModule } from 'src/bootstrap/gitlab-adapter.module';
import { LicenceStoragePort } from '../domain/port/out/licence.storage.port';

const ConfigurationFacadeProvider = {
  provide: 'ConfigurationFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    repositoryFacade: RepositoryFacade,
    environmentPermissionFacade: EnvironmentPermissionFacade,
    secretValuesStoragePort: SecretValuesStoragePort,
    configurationAuditFacade: ConfigurationAuditFacade,
  ) =>
    new ConfigurationService(
      configurationStoragePort,
      repositoryFacade,
      environmentPermissionFacade,
      secretValuesStoragePort,
      configurationAuditFacade,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'RepositoryFacade',
    'EnvironmentPermissionFacade',
    'SecretManagerAdapter',
    'ConfigurationAuditFacade',
  ],
};

const EnvironmentFacadeProvider = {
  provide: 'EnvironmentFacade',
  useFactory: (
    configurationStoragePort: ConfigurationStoragePort,
    environmentStoragePort: EnvironmentStoragePort,
    secretValuesStoragePort: SecretValuesStoragePort,
    environmentAuditFacade: EnvironmentAuditFacade,
  ) =>
    new EnvironmentService(
      configurationStoragePort,
      environmentStoragePort,
      secretValuesStoragePort,
      environmentAuditFacade,
    ),
  inject: [
    'PostgresConfigurationAdapter',
    'PostgresEnvironmentAdapter',
    'SecretManagerAdapter',
    'EnvironmentAuditFacade',
  ],
};

const EnvironmentPermissionFacadeProvider = {
  provide: 'EnvironmentPermissionFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    gitlabAdapterPort: GitlabAdapterPort,
    environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    environmentPermissionUtils: EnvironmentPermissionUtils,
    environmentAuditFacade: EnvironmentAuditFacade,
  ) =>
    new EnvironmentPermissionService(
      githubAdapterPort,
      gitlabAdapterPort,
      environmentPermissionStoragePort,
      environmentPermissionUtils,
      environmentAuditFacade,
    ),
  inject: [
    'GithubAdapter',
    'GitlabAdapter',
    'PostgresEnvironmentPermissionAdapter',
    'EnvironmentPermissionUtils',
    'EnvironmentAuditFacade',
  ],
};

const AuthorizationServiceProvider = {
  provide: 'AuthorizationService',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    gitlabAdapterPort: GitlabAdapterPort,
    configurationStoragePort: ConfigurationStoragePort,
    apiKeyStoragePort: ApiKeyStoragePort,
    permissionRoleService: PermissionRoleService,
  ) =>
    new AuthorizationService(
      githubAdapterPort,
      gitlabAdapterPort,
      configurationStoragePort,
      apiKeyStoragePort,
      permissionRoleService,
    ),
  inject: [
    'GithubAdapter',
    'GitlabAdapter',
    'PostgresConfigurationAdapter',
    'PostgresApiKeyAdapter',
    'PermissionRoleService',
  ],
};

const PermissionRoleServiceProvider = {
  provide: 'PermissionRoleService',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    gitlabAdapterPort: GitlabAdapterPort,
    environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    environmentPermissionUtils: EnvironmentPermissionUtils,
  ) =>
    new PermissionRoleService(
      githubAdapterPort,
      gitlabAdapterPort,
      environmentPermissionStoragePort,
      environmentPermissionUtils,
    ),
  inject: [
    'GithubAdapter',
    'GitlabAdapter',
    'PostgresEnvironmentPermissionAdapter',
    'EnvironmentPermissionUtils',
  ],
};

const OrganizationFacadeProvider = {
  provide: 'OrganizationFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    gitlabAdapterPort: GitlabAdapterPort,
    licenceStoragePort: LicenceStoragePort,
  ) =>
    new OrganizationService(
      githubAdapterPort,
      gitlabAdapterPort,
      licenceStoragePort,
    ),
  inject: ['GithubAdapter', 'GitlabAdapter', 'PostgresLicenceAdapter'],
};

const RepositoryFacadeProvider = {
  provide: 'RepositoryFacade',
  useFactory: (
    githubAdapterPort: GithubAdapterPort,
    gitlabAdapterPort: GitlabAdapterPort,
    configurationStoragePort: ConfigurationStoragePort,
  ) =>
    new RepositoryService(
      githubAdapterPort,
      gitlabAdapterPort,
      configurationStoragePort,
    ),
  inject: ['GithubAdapter', 'GitlabAdapter', 'PostgresConfigurationAdapter'],
};

const ValuesFacadeProvider = {
  provide: 'ValuesFacade',
  useFactory: (
    secretValuesStoragePort: SecretValuesStoragePort,
    configurationFacade: ConfigurationFacade,
    environmentPermissionFacade: EnvironmentPermissionFacade,
    environmentAuditFacade: EnvironmentAuditFacade,
  ) =>
    new ValuesService(
      secretValuesStoragePort,
      configurationFacade,
      environmentPermissionFacade,
      environmentAuditFacade,
    ),
  inject: [
    'SecretManagerAdapter',
    'ConfigurationFacade',
    'EnvironmentPermissionFacade',
    'EnvironmentAuditFacade',
  ],
};

const ApiKeyFacadeProvider = {
  provide: 'ApiKeyFacade',
  useFactory: (
    configurationFacade: ConfigurationFacade,
    apiKeyStoragePort: ApiKeyStoragePort,
    environmentAuditFacade: EnvironmentAuditFacade,
  ) =>
    new ApiKeyService(
      configurationFacade,
      apiKeyStoragePort,
      environmentAuditFacade,
    ),
  inject: [
    'ConfigurationFacade',
    'PostgresApiKeyAdapter',
    'EnvironmentAuditFacade',
  ],
};

const ConfigurationAuditFacadeProvider = {
  provide: 'ConfigurationAuditFacade',
  useFactory: (configurationAuditStoragePort: ConfigurationAuditStoragePort) =>
    new ConfigurationAuditService(configurationAuditStoragePort),
  inject: ['ConfigurationAuditAdapter'],
};

const EnvironmentAuditFacadeProvider = {
  provide: 'EnvironmentAuditFacade',
  useFactory: (environmentAuditStoragePort: EnvironmentAuditStoragePort) =>
    new EnvironmentAuditService(environmentAuditStoragePort),
  inject: ['EnvironmentAuditAdapter'],
};

const EnvironmentPermissionUtilsProvider = {
  provide: 'EnvironmentPermissionUtils',
  useValue: new EnvironmentPermissionUtils(),
};

const ValuesVersionFacadeProvider = {
  provide: 'ValuesVersionFacade',
  useFactory: (secretValueStoragePort: SecretValuesStoragePort) =>
    new ValuesVersionService(secretValueStoragePort),
  inject: ['SecretManagerAdapter'],
};

@Module({
  imports: [
    PostgresAdapterModule,
    GithubAdapterModule,
    GitlabAdapterModule,
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
    ConfigurationAuditFacadeProvider,
    EnvironmentAuditFacadeProvider,
    ValuesVersionFacadeProvider,
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
    ConfigurationAuditFacadeProvider,
    EnvironmentAuditFacadeProvider,
    ValuesVersionFacadeProvider,
  ],
})
export class DomainModule {}
