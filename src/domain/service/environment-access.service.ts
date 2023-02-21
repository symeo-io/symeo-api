import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import User from 'src/domain/model/user.model';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';

export class EnvironmentAccessService implements EnvironmentAccessFacade {
  constructor(
    private repositoryFacade: RepositoryFacade,
    private githubAdapterPort: GithubAdapterPort,
  ) {}

  async getEnvironmentAccesses(
    user: User,
    vcsRepositoryId: number,
  ): Promise<EnvironmentAccess[]> {
    const vcsRepository = await this.repositoryFacade.getRepositoryById(
      user,
      vcsRepositoryId,
    );

    if (!vcsRepository) {
      throw new SymeoException(
        `Repository not found for id ${vcsRepositoryId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    return await this.githubAdapterPort.getEnvironmentAccesses(
      user,
      vcsRepository.owner.name,
      vcsRepository.name,
    );
  }
}
