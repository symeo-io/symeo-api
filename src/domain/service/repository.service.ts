import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import User from 'src/domain/model/user.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';

export class RepositoryService implements RepositoryFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly configurationStoragePort: ConfigurationStoragePort,
  ) {}
  async getRepositories(user: User): Promise<VcsRepository[]> {
    let repositories: VcsRepository[];
    switch (user.provider) {
      case VCSProvider.GitHub:
        repositories = await this.githubAdapterPort.getRepositories(user);
        break;
      default:
        repositories = [];
        break;
    }

    const promises = [];
    for (const repository of repositories) {
      promises.push(
        this.configurationStoragePort
          .findAllForRepositoryId(repository.vcsType, repository.id)
          .then((configurations) => {
            repository.configurations = configurations;
          }),
      );
    }

    await Promise.all(promises);

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
