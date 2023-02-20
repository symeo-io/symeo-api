import { RightFacade } from 'src/domain/port/in/right.facade.port';
import User from 'src/domain/model/user.model';
import { Right } from 'src/domain/model/right/right.model';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';

export class RightService implements RightFacade {
  constructor(
    private repositoryFacade: RepositoryFacade,
    private githubAdapterPort: GithubAdapterPort,
  ) {}

  async getRights(user: User, vcsRepositoryId: number): Promise<Right[]> {
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

    return await this.githubAdapterPort.getRights(
      user,
      vcsRepository.owner.name,
      vcsRepository.name,
    );
  }
}
