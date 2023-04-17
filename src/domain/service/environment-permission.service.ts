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
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

export class EnvironmentPermissionService
  implements EnvironmentPermissionFacade
{
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private gitlabAdapterPort: GitlabAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
    private environmentAuditFacade: EnvironmentAuditFacade,
  ) {}

  async getEnvironmentPermissionRole(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
  ): Promise<EnvironmentPermissionRole> {
    const userVcsId = user.getVcsUserId();
    const inBaseEnvironmentPermissions: EnvironmentPermission | undefined =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserId(
        environment.id,
        userVcsId,
      );
    if (inBaseEnvironmentPermissions) {
      return inBaseEnvironmentPermissions.environmentPermissionRole;
    } else {
      const githubUserRepositoryRole: VcsRepositoryRole | undefined =
        await this.githubAdapterPort.getUserRepositoryRole(user, repository.id);
      if (!githubUserRepositoryRole) {
        throw new SymeoException(
          `User with vcsId ${userVcsId} do not have access to repository with repositoryVcsId ${repository.id}`,
          SymeoExceptionCode.REPOSITORY_NOT_FOUND,
        );
      }

      return this.environmentPermissionUtils.mapVcsRoleToDefaultEnvironmentPermission(
        githubUserRepositoryRole,
      );
    }
  }

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
      case VCSProvider.Gitlab:
        return this.getEnvironmentPermissionsWithGitlab(
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
        return this.findForConfigurationAndGithubUser(
          user,
          repository,
          configuration,
        );
      case VCSProvider.Gitlab:
        return this.findForConfigurationAndGitlabUser(
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
    environment: Environment,
    environmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]> {
    if (
      user.provider !== VCSProvider.GitHub &&
      user.provider !== VCSProvider.Gitlab
    ) {
      return [];
    }

    const previousEnvironmentPermissions: EnvironmentPermissionWithUser[] =
      await this.getEnvironmentPermissionsForEnvironmentAndUserVcsIds(
        user,
        repository,
        environment,
        environmentPermissions,
      );

    const updatedEnvironmentPermissions: EnvironmentPermission[] =
      await this.saveEnvironmentPermissions(environmentPermissions);
    await this.environmentAuditFacade.saveAllWithPermissionMetadataType(
      EnvironmentAuditEventType.PERMISSION_UPDATED,
      user,
      repository,
      environment,
      previousEnvironmentPermissions,
      updatedEnvironmentPermissions,
    );
    return updatedEnvironmentPermissions;
  }

  private async getEnvironmentPermissionsWithGithub(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermissionWithUser[]> {
    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        repository.id,
      );

    const persistedEnvironmentPermissionsForEnvironmentId: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentId(
        environment.id,
      );

    const persistedEnvironmentPermissionsForEnvironmentAndVcsUsers =
      await this.removePersistedEnvironmentPermissionWithoutVcsAccess(
        githubRepositoryUsers,
        persistedEnvironmentPermissionsForEnvironmentId,
      );

    const persistedEnvironmentPermissionsForEnvironmentAndVcsUsersWithoutVcsAdminRole =
      await this.removePersistedEnvironmentPermissionWithVcsAdminRole(
        githubRepositoryUsers,
        persistedEnvironmentPermissionsForEnvironmentAndVcsUsers,
      );

    return githubRepositoryUsers.map((vcsUser) => {
      const persistedEnvironmentPermission =
        persistedEnvironmentPermissionsForEnvironmentAndVcsUsersWithoutVcsAdminRole.find(
          (inBaseEnvironmentPermission) =>
            inBaseEnvironmentPermission.userVcsId === vcsUser.id,
        );

      if (!!persistedEnvironmentPermission)
        return this.environmentPermissionUtils.generateEnvironmentPermissionWithUser(
          vcsUser,
          persistedEnvironmentPermission,
        );

      return this.environmentPermissionUtils.generateDefaultEnvironmentPermissionFromVcsUser(
        vcsUser,
        environment,
      );
    });
  }

  private async getEnvironmentPermissionsWithGitlab(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermissionWithUser[]> {
    const gitlabRepositoryUsers: VcsUser[] =
      await this.gitlabAdapterPort.getCollaboratorsForRepository(
        user,
        repository.id,
      );
    const persistedEnvironmentPermissionsForEnvironmentId: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentId(
        environment.id,
      );

    const persistedEnvironmentPermissionsForEnvironmentAndVcsUsers =
      await this.removePersistedEnvironmentPermissionWithoutVcsAccess(
        gitlabRepositoryUsers,
        persistedEnvironmentPermissionsForEnvironmentId,
      );

    const persistedEnvironmentPermissionsForEnvironmentAndVcsUsersWithoutVcsAdminRole =
      await this.removePersistedEnvironmentPermissionWithVcsAdminRole(
        gitlabRepositoryUsers,
        persistedEnvironmentPermissionsForEnvironmentAndVcsUsers,
      );

    return gitlabRepositoryUsers.map((vcsUser) => {
      const persistedEnvironmentPermission =
        persistedEnvironmentPermissionsForEnvironmentAndVcsUsersWithoutVcsAdminRole.find(
          (inBaseEnvironmentPermission) =>
            inBaseEnvironmentPermission.userVcsId === vcsUser.id,
        );

      if (!!persistedEnvironmentPermission)
        return this.environmentPermissionUtils.generateEnvironmentPermissionWithUser(
          vcsUser,
          persistedEnvironmentPermission,
        );

      return this.environmentPermissionUtils.generateDefaultEnvironmentPermissionFromVcsUser(
        vcsUser,
        environment,
      );
    });
  }

  private async removePersistedEnvironmentPermissionWithoutVcsAccess(
    vcsRepositoryUsers: VcsUser[],
    persistedEnvironmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]> {
    const persistedEnvironmentPermissionsToRemoveToKeep: EnvironmentPermission[] =
      [];
    const persistedEnvironmentPermissionsToRemove: EnvironmentPermission[] = [];

    persistedEnvironmentPermissions.forEach((environmentPermission) => {
      const vcsUserInBase = vcsRepositoryUsers.find(
        (vcsUser) => environmentPermission.userVcsId === vcsUser.id,
      );
      if (!vcsUserInBase) {
        persistedEnvironmentPermissionsToRemove.push(environmentPermission);
        return;
      }

      persistedEnvironmentPermissionsToRemoveToKeep.push(environmentPermission);
    });
    await this.environmentPermissionStoragePort.removeAll(
      persistedEnvironmentPermissionsToRemove,
    );

    return persistedEnvironmentPermissionsToRemoveToKeep;
  }

  private async removePersistedEnvironmentPermissionWithVcsAdminRole(
    vcsRepositoryUsers: VcsUser[],
    persistedEnvironmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]> {
    const persistedEnvironmentPermissionsToRemoveToKeep: EnvironmentPermission[] =
      [];
    const persistedEnvironmentPermissionsToRemove: EnvironmentPermission[] = [];

    persistedEnvironmentPermissions.forEach((environmentPermission) => {
      const vcsUserWithAdminRole = vcsRepositoryUsers.find(
        (vcsUser) =>
          environmentPermission.userVcsId === vcsUser.id &&
          vcsUser.role === VcsRepositoryRole.ADMIN,
      );
      if (vcsUserWithAdminRole) {
        persistedEnvironmentPermissionsToRemove.push(environmentPermission);
        return;
      }

      persistedEnvironmentPermissionsToRemoveToKeep.push(environmentPermission);
    });

    await this.environmentPermissionStoragePort.removeAll(
      persistedEnvironmentPermissionsToRemove,
    );

    return persistedEnvironmentPermissionsToRemoveToKeep;
  }

  async findForConfigurationAndGithubUser(
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
      await this.githubAdapterPort.getUserRepositoryRole(user, repository.id);

    if (!userRepositoryRole) {
      throw new SymeoException(
        `User with vcsId ${user.getVcsUserId()} do not have access to repository with repositoryVcsId ${
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

  private async saveEnvironmentPermissions(
    environmentPermissionsToUpdate: EnvironmentPermission[],
  ) {
    await this.environmentPermissionStoragePort.saveAll(
      environmentPermissionsToUpdate,
    );

    return environmentPermissionsToUpdate;
  }

  private isUserRepositoryAdministrator(githubRepositoryUser: VcsUser) {
    return githubRepositoryUser.role === 'admin';
  }

  private async getEnvironmentPermissionsForEnvironmentAndUserVcsIds(
    user: User,
    repository: VcsRepository,
    environment: Environment,
    environmentPermissionsToUpdate: EnvironmentPermission[],
  ) {
    const previousEnvironmentPermissions: EnvironmentPermissionWithUser[] = [];
    const permissionUserIdsNotInVcsUsers: number[] = [];
    let repositoryUsersWithRole: VcsUser[];

    switch (user.provider) {
      case VCSProvider.GitHub:
        repositoryUsersWithRole =
          await this.githubAdapterPort.getCollaboratorsForRepository(
            user,
            repository.id,
          );
        break;
      case VCSProvider.Gitlab:
        repositoryUsersWithRole =
          await this.gitlabAdapterPort.getCollaboratorsForRepository(
            user,
            repository.id,
          );
        break;
    }

    const persistedEnvironmentPermissionsForEnvironmentId: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentId(
        environment.id,
      );

    environmentPermissionsToUpdate.forEach((environmentPermissionToUpdate) => {
      const persistedEnvironmentPermissionForId =
        persistedEnvironmentPermissionsForEnvironmentId.find(
          (persistedEnvironmentPermissionForEnvironmentId) =>
            persistedEnvironmentPermissionForEnvironmentId.id ===
            environmentPermissionToUpdate.id,
        );

      const repositoryUser = repositoryUsersWithRole.find(
        (vcsUser) => environmentPermissionToUpdate.userVcsId === vcsUser.id,
      );

      if (!repositoryUser) {
        permissionUserIdsNotInVcsUsers.push(
          environmentPermissionToUpdate.userVcsId,
        );
        return;
      }

      if (this.isUserRepositoryAdministrator(repositoryUser)) {
        throw new SymeoException(
          `User with vcsId ${repositoryUser.id} is administrator of the repository, thus you can not modify his environment permissions`,
          SymeoExceptionCode.UPDATE_ADMINISTRATOR_PERMISSION,
        );
      }

      if (persistedEnvironmentPermissionForId) {
        previousEnvironmentPermissions.push(
          this.environmentPermissionUtils.generateEnvironmentPermissionWithUser(
            repositoryUser,
            persistedEnvironmentPermissionForId,
          ),
        );
        return;
      }

      previousEnvironmentPermissions.push(
        this.environmentPermissionUtils.generateDefaultEnvironmentPermissionFromVcsUser(
          repositoryUser,
          environment,
        ),
      );
      return;
    });

    if (permissionUserIdsNotInVcsUsers.length > 0) {
      throw new SymeoException(
        `User with vcsIds ${permissionUserIdsNotInVcsUsers.join(
          ', ',
        )} do not have access to repository with repositoryVcsId ${
          repository.id
        }`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    return previousEnvironmentPermissions;
  }

  private async findForConfigurationAndGitlabUser(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ) {
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
      await this.gitlabAdapterPort.getUserRepositoryRole(user, repository.id);

    if (!userRepositoryRole) {
      throw new SymeoException(
        `User with vcsId ${user.getVcsUserId()} do not have access to repository with repositoryVcsId ${
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
}
