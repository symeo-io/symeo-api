import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class PermissionRoleService {
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
  ) {}

  async isUserEnvironmentPermissionRoleInRequired(
    minimumEnvironmentPermissionRoleRequired: EnvironmentPermissionRole,
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
  ): Promise<void> {
    const userVcsId: number = parseInt(user.id.split('|')[1]);

    const inBaseEnvironmentPermission: EnvironmentPermission | undefined =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserId(
        environment.id,
        userVcsId,
      );

    if (inBaseEnvironmentPermission) {
      this.checkEnvironmentPermissionRoleInRequired(
        userVcsId,
        minimumEnvironmentPermissionRoleRequired,
        inBaseEnvironmentPermission.environmentPermissionRole,
      );
    }

    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        repository.owner.name,
        repository.name,
      );

    const githubVcsUser: VcsUser | undefined = githubRepositoryUsers.find(
      (vcsUser) => vcsUser.id === userVcsId,
    );

    if (!githubVcsUser) {
      throw new SymeoException(
        `User with vcsId ${userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    const environmentPermissionRole =
      this.environmentPermissionUtils.mapGithubRoleToDefaultEnvironmentPermission(
        githubVcsUser.vcsRepositoryRole,
      );

    this.checkEnvironmentPermissionRoleInRequired(
      userVcsId,
      minimumEnvironmentPermissionRoleRequired,
      environmentPermissionRole,
    );
  }

  async isUserVcsRepositoryRoleInRequired(
    minimumVcsRepositoryRoleRequired: VcsRepositoryRole,
    user: User,
    repository: VcsRepository,
  ) {
    const userVcsId: number = parseInt(user.id.split('|')[1]);

    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        repository.owner.name,
        repository.name,
      );

    const githubVcsUser: VcsUser | undefined = githubRepositoryUsers.find(
      (vcsUser) => vcsUser.id === userVcsId,
    );

    if (!githubVcsUser) {
      throw new SymeoException(
        `User with vcsId ${userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    this.checkVcsRepositoryRoleInRequired(
      githubVcsUser,
      minimumVcsRepositoryRoleRequired,
    );
  }

  private checkEnvironmentPermissionRoleInRequired(
    userVcsId: number,
    minimumEnvironmentPermissionRoleRequired: EnvironmentPermissionRole,
    environmentPermissionRole: EnvironmentPermissionRole,
  ): void {
    if (
      minimumEnvironmentPermissionRoleRequired ===
        EnvironmentPermissionRole.ADMIN &&
      environmentPermissionRole !== EnvironmentPermissionRole.ADMIN
    ) {
      this.throwResourceAccessDeniedException(
        userVcsId,
        minimumEnvironmentPermissionRoleRequired,
      );
    }

    if (
      minimumEnvironmentPermissionRoleRequired ===
        EnvironmentPermissionRole.WRITE &&
      environmentPermissionRole !==
        (EnvironmentPermissionRole.ADMIN || EnvironmentPermissionRole.WRITE)
    ) {
      this.throwResourceAccessDeniedException(
        userVcsId,
        minimumEnvironmentPermissionRoleRequired,
      );
    }

    if (
      minimumEnvironmentPermissionRoleRequired ===
        EnvironmentPermissionRole.READ_SECRET &&
      environmentPermissionRole === EnvironmentPermissionRole.READ_NON_SECRET
    ) {
      this.throwResourceAccessDeniedException(
        userVcsId,
        minimumEnvironmentPermissionRoleRequired,
      );
    }
  }

  private checkVcsRepositoryRoleInRequired(
    githubVcsUser: VcsUser,
    minimumVcsRepositoryRoleRequired: VcsRepositoryRole,
  ) {
    if (
      minimumVcsRepositoryRoleRequired === VcsRepositoryRole.ADMIN &&
      githubVcsUser.vcsRepositoryRole !== VcsRepositoryRole.ADMIN
    ) {
      this.throwResourceAccessDeniedException(
        githubVcsUser.id,
        minimumVcsRepositoryRoleRequired,
      );
    }

    if (
      minimumVcsRepositoryRoleRequired === VcsRepositoryRole.MAINTAIN &&
      githubVcsUser.vcsRepositoryRole !==
        (VcsRepositoryRole.ADMIN || VcsRepositoryRole.MAINTAIN)
    ) {
      this.throwResourceAccessDeniedException(
        githubVcsUser.id,
        minimumVcsRepositoryRoleRequired,
      );
    }

    if (
      minimumVcsRepositoryRoleRequired === VcsRepositoryRole.WRITE &&
      githubVcsUser.vcsRepositoryRole !==
        (VcsRepositoryRole.ADMIN ||
          VcsRepositoryRole.MAINTAIN ||
          VcsRepositoryRole.WRITE)
    ) {
      this.throwResourceAccessDeniedException(
        githubVcsUser.id,
        minimumVcsRepositoryRoleRequired,
      );
    }

    if (
      minimumVcsRepositoryRoleRequired === VcsRepositoryRole.TRIAGE &&
      githubVcsUser.vcsRepositoryRole !==
        (VcsRepositoryRole.ADMIN ||
          VcsRepositoryRole.MAINTAIN ||
          VcsRepositoryRole.WRITE ||
          VcsRepositoryRole.TRIAGE)
    ) {
      this.throwResourceAccessDeniedException(
        githubVcsUser.id,
        minimumVcsRepositoryRoleRequired,
      );
    }
  }

  private throwResourceAccessDeniedException(
    userVcsId: number,
    minimumPermissionRequired: EnvironmentPermissionRole | VcsRepositoryRole,
  ) {
    throw new SymeoException(
      `User with userVcsId ${userVcsId} is trying to access resources he do not have permission for (minimum ${minimumPermissionRequired} permission required)`,
      SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
    );
  }
}
