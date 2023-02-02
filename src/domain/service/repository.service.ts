import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import User from 'src/domain/model/user.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';

export class RepositoryService implements RepositoryFacade {
  constructor(private readonly githubAdapterPort: GithubAdapterPort) {}
  async getRepositories(user: User): Promise<VcsRepository[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getRepositories(user);
      default:
        return [];
    }
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getRepositoryById(
          user,
          repositoryVcsId,
        );
      default:
        return undefined;
    }
  }

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

  async checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.checkFileExistsOnBranch(
          user,
          repositoryOwnerName,
          repositoryName,
          filePath,
          branch,
        );
      default:
        return false;
    }
  }
}
