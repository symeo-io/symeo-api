import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionUtils } from 'src/domain/utils/environment-permission.utils';
import { CheckAuthorizationService } from 'src/domain/service/check-authorization.service';

export class EnvironmentPermissionService
  implements EnvironmentPermissionFacade
{
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
    private environmentPermissionUtils: EnvironmentPermissionUtils,
    private checkAuthorizationService: CheckAuthorizationService,
  ) {}

  async getEnvironmentPermissions(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<EnvironmentPermission[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return this.getEnvironmentPermissionsWithGithub(
          user,
          repositoryVcsId,
          configurationId,
          environmentId,
        );
      default:
        return [];
    }
  }

  private async getEnvironmentPermissionsWithGithub(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
  ) {
    const authorizations =
      await this.checkAuthorizationService.hasUserAuthorizationToVcsRepositoryAndConfigurationAndEnvironment(
        user,
        repositoryVcsId,
        configurationId,
        environmentId,
      );

    const vcsRepository = authorizations.vcsRepository;
    const environment = authorizations.environment;

    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        vcsRepository.owner.name,
        vcsRepository.name,
      );

    const inBaseEnvironmentPermissions: EnvironmentPermission[] =
      await this.environmentPermissionStoragePort.findForEnvironmentIdAndVcsUserIds(
        environmentId,
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
