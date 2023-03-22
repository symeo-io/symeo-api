import {
  ENVIRONMENT_PERMISSION_ROLE_ORDER,
  EnvironmentPermissionRole,
} from 'src/domain/model/environment-permission/environment-permission-role.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import {
  VCS_REPOSITORY_ROLE_ORDER,
  VcsRepositoryRole,
} from 'src/domain/model/vcs/vcs.repository.role.enum';

export class PermissionRoleService {
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
  ) {}

  async checkUserHasRequiredEnvironmentRole(
    requiredRole: EnvironmentPermissionRole,
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<void> {
    const userVcsId = user.getVcsUserId();

    const persistedEnvironmentPermission =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserId(
        environment.id,
        userVcsId,
      );

    if (persistedEnvironmentPermission) {
      return this.checkUserEnvironmentRoleIsAboveRequiredRole(
        userVcsId,
        requiredRole,
        persistedEnvironmentPermission.environmentPermissionRole,
      );
    }

    const userRepositoryRole =
      await this.githubAdapterPort.getUserRepositoryRole(user, repository.id);

    if (!userRepositoryRole) {
      throw new SymeoException(
        `User with vcsId ${userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    const environmentPermissionRole =
      this.environmentPermissionUtils.mapGithubRoleToDefaultEnvironmentPermission(
        userRepositoryRole,
      );

    return this.checkUserEnvironmentRoleIsAboveRequiredRole(
      userVcsId,
      requiredRole,
      environmentPermissionRole,
    );
  }

  async checkUserHasRequiredRepositoryRole(
    requiredRole: VcsRepositoryRole,
    user: User,
    repository: VcsRepository,
  ) {
    const userVcsId = user.getVcsUserId();

    const userRepositoryRole =
      await this.githubAdapterPort.getUserRepositoryRole(user, repository.id);

    if (!userRepositoryRole) {
      throw new SymeoException(
        `User with vcsId ${userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    return this.checkUserRepositoryRoleIsAboveRequiredRole(
      userVcsId,
      userRepositoryRole,
      requiredRole,
    );
  }

  private checkUserEnvironmentRoleIsAboveRequiredRole(
    userVcsId: number,
    requiredRole: EnvironmentPermissionRole,
    userRole: EnvironmentPermissionRole,
  ): void {
    if (
      ENVIRONMENT_PERMISSION_ROLE_ORDER.indexOf(userRole) <
      ENVIRONMENT_PERMISSION_ROLE_ORDER.indexOf(requiredRole)
    ) {
      this.throwResourceAccessDeniedException(userVcsId, requiredRole);
    }
  }

  private checkUserRepositoryRoleIsAboveRequiredRole(
    userVcsId: number,
    userRole: VcsRepositoryRole,
    requiredRole: VcsRepositoryRole,
  ) {
    if (
      VCS_REPOSITORY_ROLE_ORDER.indexOf(userRole) <
      VCS_REPOSITORY_ROLE_ORDER.indexOf(requiredRole)
    ) {
      this.throwResourceAccessDeniedException(userVcsId, requiredRole);
    }
  }

  private throwResourceAccessDeniedException(
    userVcsId: number,
    requiredPermission: EnvironmentPermissionRole | VcsRepositoryRole,
  ) {
    throw new SymeoException(
      `User with userVcsId ${userVcsId} is trying to access resources he do not have permission for (minimum ${requiredPermission} permission required)`,
      SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
    );
  }
}
