import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import Environment from 'src/domain/model/environment/environment.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import Configuration from 'src/domain/model/configuration/configuration.model';

export class EnvironmentPermissionService
  implements EnvironmentPermissionFacade
{
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
  ) {}

  async getEnvironmentPermissionUsers(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermissionWithUser[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return this.getEnvironmentPermissionsWithGithub(
          user,
          repository,
          environment,
        );
      default:
        return [];
    }
  }

  async findForConfigurationAndUser(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return this.findForConfigurationAndUserWithGithub(
          user,
          repository,
          configuration,
        );
      default:
        return [];
    }
  }

  async updateEnvironmentPermissions(
    user: User,
    repository: VcsRepository,
    environmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return this.updateEnvironmentPermissionsWithGithub(
          user,
          repository,
          environmentPermissions,
        );
      default:
        return [];
    }
  }

  private async getEnvironmentPermissionsWithGithub(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ) {
    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        repository.owner.name,
        repository.name,
      );

    const persistedEnvironmentPermissions: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserIds(
        environment.id,
        githubRepositoryUsers.map((vcsUser) => vcsUser.id),
      );

    return githubRepositoryUsers.map((vcsUser) => {
      const inBaseEnvironmentPermission = persistedEnvironmentPermissions.find(
        (inBaseEnvironmentPermission) =>
          inBaseEnvironmentPermission.userVcsId === vcsUser.id,
      );

      if (!!inBaseEnvironmentPermission)
        return this.environmentPermissionUtils.generateEnvironmentPermissionUser(
          vcsUser,
          inBaseEnvironmentPermission,
        );

      return this.environmentPermissionUtils.generateDefaultEnvironmentPermissionFromVcsUser(
        vcsUser,
        environment,
      );
    });
  }

  async findForConfigurationAndUserWithGithub(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]> {
    const persistedEnvironmentPermissions: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentIdsAndVcsUserId(
        configuration.environments.map((environment) => environment.id),
        user.getVcsUserId(),
      );

    if (
      persistedEnvironmentPermissions.length ===
      configuration.environments.length
    ) {
      return persistedEnvironmentPermissions;
    }

    const userRepositoryRole =
      await this.githubAdapterPort.getUserRepositoryRole(
        user,
        repository.owner.name,
        repository.name,
      );

    if (!userRepositoryRole) {
      throw new SymeoException(
        `User with vcsId ${user.getVcsUserId()} do not have access to repository with vcsRepositoryId ${
          repository.id
        }`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    const environmentsWithMissingPermissions =
      configuration.environments.filter(
        (environment) =>
          !persistedEnvironmentPermissions.find(
            (permission) => permission.environmentId === environment.id,
          ),
      );

    const generatedPermissions = environmentsWithMissingPermissions.map(
      (environment) =>
        this.environmentPermissionUtils.generateDefaultEnvironmentPermission(
          user.getVcsUserId(),
          userRepositoryRole,
          environment,
        ),
    );

    return [...persistedEnvironmentPermissions, ...generatedPermissions];
  }

  private async updateEnvironmentPermissionsWithGithub(
    user: User,
    repository: VcsRepository,
    environmentPermissionsToUpdate: EnvironmentPermission[],
  ) {
    await this.validateEnvironmentPermissions(
      environmentPermissionsToUpdate,
      user,
      repository,
    );

    await this.environmentPermissionStoragePort.saveAll(
      environmentPermissionsToUpdate,
    );

    return environmentPermissionsToUpdate;
  }

  private async validateEnvironmentPermissions(
    environmentPermissionsToUpdate: EnvironmentPermission[],
    user: User,
    repository: VcsRepository,
  ): Promise<void> {
    const githubRepositoryUsersWithRole: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        repository.owner.name,
        repository.name,
      );

    const permissionUserIdsNotInGithubUsers: number[] = [];

    environmentPermissionsToUpdate.forEach((environmentPermissionToUpdate) => {
      const githubRepositoryUser = githubRepositoryUsersWithRole.find(
        (vcsUser) => environmentPermissionToUpdate.userVcsId === vcsUser.id,
      );
      if (!githubRepositoryUser) {
        permissionUserIdsNotInGithubUsers.push(
          environmentPermissionToUpdate.userVcsId,
        );
      } else if (this.isUserRepositoryAdministrator(githubRepositoryUser)) {
        throw new SymeoException(
          `User with vcsId ${githubRepositoryUser.id} is administrator of the repository, thus you can not modify his environment permissions`,
          SymeoExceptionCode.UPDATE_ADMINISTRATOR_PERMISSION,
        );
      }
    });

    if (permissionUserIdsNotInGithubUsers.length > 0) {
      throw new SymeoException(
        `User with vcsIds ${permissionUserIdsNotInGithubUsers.join(
          ', ',
        )} do not have access to repository with vcsRepositoryId ${
          repository.id
        }`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }
  }

  private isUserRepositoryAdministrator(githubRepositoryUser: VcsUser) {
    return githubRepositoryUser.role === 'admin';
  }
}
