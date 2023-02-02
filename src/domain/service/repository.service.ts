import { RepositoryFacade } from '../port/in/repository.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';
import User from '../model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class RepositoryService implements RepositoryFacade {
  constructor(private readonly githubAdapterPort: GithubAdapterPort) {}

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.hasAccessToRepository(
          user,
          repositoryVcsId,
        );
      default:
        return false;
    }
  }
}
