import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';

export class RepositoryService implements RepositoryFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly configurationStoragePort: ConfigurationStoragePort,
  ) {}
  async getRepositories(user: User): Promise<VcsRepository[]> {
    let start = Date.now();
    console.log('RepositoryService', 'getRepositories start', '0s');
    let repositories: VcsRepository[];
    switch (user.provider) {
      case VCSProvider.GitHub:
        repositories = await this.githubAdapterPort.getRepositories(user);
        break;
      default:
        repositories = [];
        break;
    }
    console.log(
      'RepositoryService',
      'await this.githubAdapterPort.getRepositories',
      `${(Date.now() - start) / 1000}s`,
    );
    start = Date.now();

    const configurations =
      await this.configurationStoragePort.findAllForRepositoryIds(
        user.provider,
        repositories.map((repository) => repository.id),
      );

    console.log(
      'RepositoryService',
      'await this.configurationStoragePort.findAllForRepositoryIds',
      `${(Date.now() - start) / 1000}s`,
    );
    start = Date.now();

    for (const repository of repositories) {
      repository.configurations = configurations.filter(
        (configuration) => configuration.repository.vcsId === repository.id,
      );
    }

    console.log(
      'RepositoryService',
      'configuration.repository.vcsId === repository.id',
      `${(Date.now() - start) / 1000}s`,
    );

    return repositories;
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

  async getBranchByRepositoryId(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsBranch[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getBranchByRepositoryId(
          user,
          repositoryVcsId,
        );
      default:
        return [];
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

  async getFileContent(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getFileContent(
          user,
          repositoryOwnerName,
          repositoryName,
          filePath,
          branch,
        );
      default:
        return '';
    }
  }
}
