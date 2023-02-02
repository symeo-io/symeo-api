import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import User from 'src/domain/model/user.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';

export class RepositoryService implements RepositoryFacade {
  constructor(private readonly githubAdapterPort: GithubAdapterPort) {}
  async getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getRepositories(
          user,
          organizationName,
        );
      default:
        return [];
    }
  }
}
