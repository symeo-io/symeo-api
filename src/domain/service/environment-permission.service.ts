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

export class EnvironmentPermissionService
  implements EnvironmentPermissionFacade
{
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
  ) {}

  async getEnvironmentPermissions(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermission[]> {
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

    const inBaseEnvironmentPermissions: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserIds(
        environment.id,
        githubRepositoryUsers.map((vcsUser) => vcsUser.id),
      );

    const environmentPermissionsToReturn = githubRepositoryUsers.map(
      (vcsUser) => {
        const inBaseEnvironmentPermission = inBaseEnvironmentPermissions.find(
          (inBaseEnvironmentPermission) =>
            inBaseEnvironmentPermission.userVcsId === vcsUser.id,
        );

        if (!!inBaseEnvironmentPermission)
          return this.environmentPermissionUtils.generateEnvironmentPermission(
            vcsUser,
            inBaseEnvironmentPermission,
          );

        return this.environmentPermissionUtils.generateDefaultEnvironmentPermissionFromVcsUser(
          vcsUser,
          environment,
        );
      },
    );

    return environmentPermissionsToReturn;
  }
}
