import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

export class RepositoryService implements RepositoryFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly gitlabAdapterPort: GitlabAdapterPort,
    private readonly configurationStoragePort: ConfigurationStoragePort,
  ) {}
  async getRepositories(user: User): Promise<VcsRepository[]> {
    let repositories: VcsRepository[];
    switch (user.provider) {
      case VCSProvider.GitHub:
        repositories = await this.githubAdapterPort.getRepositories(user);
        break;
      case VCSProvider.Gitlab:
        repositories = await this.gitlabAdapterPort.getRepositories(user);
        break;
      default:
        repositories = [];
        break;
    }

    const configurations =
      await this.configurationStoragePort.findAllForRepositoryIds(
        user.provider,
        repositories.map((repository) => repository.id),
      );

    for (const repository of repositories) {
      repository.configurations = configurations.filter(
        (configuration) => configuration.repository.vcsId === repository.id,
      );
    }

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
      case VCSProvider.Gitlab:
        return await this.gitlabAdapterPort.getRepositoryById(
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
      case VCSProvider.Gitlab:
        return await this.gitlabAdapterPort.getBranchByRepositoryId(
          user,
          repositoryVcsId,
        );
      default:
        return [];
    }
  }

  async getEnvFilesForRepositoryIdAndBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<EnvFile[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getEnvFilesForRepositoryIdAndBranch(
          user,
          repositoryVcsId,
          branch,
        );
      case VCSProvider.Gitlab:
        return await this.gitlabAdapterPort.getEnvFilesForRepositoryIdAndBranch(
          user,
          repositoryVcsId,
          branch,
        );
      default:
        return [];
    }
  }

  async commitFileToRepositoryBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
    filePath: string,
    fileContent: string,
    commitMessage: string,
  ): Promise<void> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.commitFileToRepositoryBranch(
          user,
          repositoryVcsId,
          branch,
          filePath,
          fileContent,
          commitMessage,
        );
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
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.checkFileExistsOnBranch(
          user,
          repositoryId,
          filePath,
          branch,
        );
      default:
        return false;
    }
  }

  async getFileContent(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getFileContent(
          user,
          repositoryId,
          filePath,
          branch,
        );
      default:
        return '';
    }
  }
}
