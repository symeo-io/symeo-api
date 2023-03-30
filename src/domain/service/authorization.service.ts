import User from 'src/domain/model/user/user.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';
import ApiKey from 'src/domain/model/environment/api-key.model';
import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { PermissionRoleService } from 'src/domain/service/permission-role.service';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

export class AuthorizationService {
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private gitlabAdapterPort: GitlabAdapterPort,
    private configurationStoragePort: ConfigurationStoragePort,
    private apiKeyStoragePort: ApiKeyStoragePort,
    private permissionRoleService: PermissionRoleService,
  ) {}

  async hasUserAuthorizationToRepository(
    user: User,
    repositoryVcsId: number,
    requiredRepositoryRole?: VcsRepositoryRole,
  ): Promise<{ repository: VcsRepository }> {
    let repository: VcsRepository | undefined;
    switch (user.provider) {
      case VCSProvider.GitHub:
        repository = await this.githubAdapterPort.getRepositoryById(
          user,
          repositoryVcsId,
        );
        break;
      case VCSProvider.Gitlab:
        repository = await this.gitlabAdapterPort.getRepositoryById(
          user,
          repositoryVcsId,
        );
        break;
    }

    if (!repository) {
      throw new SymeoException(
        `Repository not found for repositoryVcsId ${repositoryVcsId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    if (requiredRepositoryRole) {
      await this.permissionRoleService.checkUserHasRequiredRepositoryRole(
        requiredRepositoryRole,
        user,
        repository,
      );
    }

    return { repository };
  }

  async hasUserAuthorizationToConfiguration(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    requiredRepositoryRole?: VcsRepositoryRole,
  ): Promise<{ repository: VcsRepository; configuration: Configuration }> {
    const { repository } = await this.hasUserAuthorizationToRepository(
      user,
      repositoryVcsId,
      requiredRepositoryRole,
    );

    const configuration =
      await this.configurationStoragePort.findByIdAndRepositoryVcsId(
        configurationId,
        repository.id,
      );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    configuration.isCurrentUserRepositoryAdmin = repository.isCurrentUserAdmin;

    return { repository, configuration };
  }

  async hasUserAuthorizationToEnvironment(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
    requiredEnvironmentRole?: EnvironmentPermissionRole,
  ): Promise<{
    repository: VcsRepository;
    configuration: Configuration;
    environment: Environment;
  }> {
    const { repository, configuration } =
      await this.hasUserAuthorizationToConfiguration(
        user,
        repositoryVcsId,
        configurationId,
      );

    const environment = configuration.environments.find(
      (environment: Environment) => environment.id === environmentId,
    );

    if (!environment) {
      throw new SymeoException(
        `Environment not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId} and environmentId ${environmentId}`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }

    if (requiredEnvironmentRole) {
      await this.permissionRoleService.checkUserHasRequiredEnvironmentRole(
        requiredEnvironmentRole,
        user,
        repository,
        environment,
      );
    }

    return { repository, configuration, environment };
  }

  async hasUserAuthorizationToApiKey(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
    apiKeyId: string,
    requiredEnvironmentRole?: EnvironmentPermissionRole,
  ): Promise<{
    repository: VcsRepository;
    configuration: Configuration;
    environment: Environment;
    apiKey: ApiKey;
  }> {
    const { repository, configuration, environment } =
      await this.hasUserAuthorizationToEnvironment(
        user,
        repositoryVcsId,
        configurationId,
        environmentId,
        requiredEnvironmentRole,
      );

    const apiKey = await this.apiKeyStoragePort.findById(apiKeyId);

    if (!apiKey || apiKey.environmentId !== environment.id) {
      throw new SymeoException(
        `Api key not found for id ${apiKeyId}`,
        SymeoExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    return { repository, configuration, environment, apiKey };
  }
}
