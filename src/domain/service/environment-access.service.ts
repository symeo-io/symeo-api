import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { EnvironmentAccessStoragePort } from 'src/domain/port/out/environment-access.storage.port';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentAccessUtils } from 'src/domain/utils/environment-access.utils';

export class EnvironmentAccessService implements EnvironmentAccessFacade {
  constructor(
    private repositoryFacade: RepositoryFacade,
    private githubAdapterPort: GithubAdapterPort,
    private environmentAccessStoragePort: EnvironmentAccessStoragePort,
    private environmentAccessUtils: EnvironmentAccessUtils,
  ) {}

  async getEnvironmentAccesses(
    user: User,
    vcsRepositoryId: number,
    environmentId: string,
  ): Promise<EnvironmentAccess[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return this.getEnvironmentAccessesWithGithub(
          user,
          vcsRepositoryId,
          environmentId,
        );
      default:
        return [];
    }
  }

  private async getEnvironmentAccessesWithGithub(
    user: User,
    vcsRepositoryId: number,
    environmentId: string,
  ) {
    const vcsRepository = await this.githubAdapterPort.getRepositoryById(
      user,
      vcsRepositoryId,
    );

    if (!vcsRepository) {
      throw new SymeoException(
        `Repository not found for id ${vcsRepositoryId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    const githubRepositoryUsers: VcsUser[] =
      await this.githubAdapterPort.getCollaboratorsForRepository(
        user,
        vcsRepository.owner.name,
        vcsRepository.name,
      );

    const inBaseEnvironmentAccesses: EnvironmentAccess[] =
      await this.environmentAccessStoragePort.findForEnvironmentIdAndVcsUserIds(
        environmentId,
        githubRepositoryUsers.map((vcsUser) => vcsUser.id),
      );

    const environmentAccessesToReturn = githubRepositoryUsers.map((vcsUser) => {
      const optionalInBaseEnvironmentAccess = inBaseEnvironmentAccesses.find(
        (inBaseEnvironmentAccess) =>
          inBaseEnvironmentAccess.userVcsId === vcsUser.id,
      );

      if (!!optionalInBaseEnvironmentAccess)
        return optionalInBaseEnvironmentAccess;

      return this.environmentAccessUtils.generateDefaultEnvironmentAccessFromVcsUser(
        vcsUser,
      );
    });

    return environmentAccessesToReturn;
  }
}
