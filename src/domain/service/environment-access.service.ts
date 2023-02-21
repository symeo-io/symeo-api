import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { EnvironmentAccessStoragePort } from 'src/domain/port/out/environment-access.storage.port';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class EnvironmentAccessService implements EnvironmentAccessFacade {
  constructor(
    private repositoryFacade: RepositoryFacade,
    private githubAdapterPort: GithubAdapterPort,
    private environmentAccessStoragePort: EnvironmentAccessStoragePort,
  ) {}

  async getEnvironmentAccesses(
    user: User,
    vcsRepositoryId: number,
    environmentId: string,
  ): Promise<EnvironmentAccess[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
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

        const githubEnvironmentAccesses: EnvironmentAccess[] =
          await this.githubAdapterPort.getGithubEnvironmentAccesses(
            user,
            vcsRepository.owner.name,
            vcsRepository.name,
            environmentId,
          );

        const environmentAccessesToReturn: EnvironmentAccess[] = [];
        for (const githubEnvironmentAccess of githubEnvironmentAccesses) {
          const alreadySavedEnvironmentAccess =
            await this.environmentAccessStoragePort.findOptionalForUserVcsIdAndEnvironmentId(
              githubEnvironmentAccess.user.vcsId,
              environmentId,
            );
          environmentAccessesToReturn.push(
            !!alreadySavedEnvironmentAccess
              ? alreadySavedEnvironmentAccess
              : githubEnvironmentAccess,
          );
        }
        return environmentAccessesToReturn;
      default:
        return [];
    }
  }
}
