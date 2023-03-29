import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { Injectable } from '@nestjs/common';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import { config } from 'symeo-js';
import { plainToInstance } from 'class-transformer';
import { uniqBy } from 'lodash';
import { GitlabOrganizationMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.organization.mapper';
import { GitlabRepositoryDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.repository.dto';
import { GitlabAuthenticatedUserDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.authenticated.user.dto';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { GithubRepositoryMapper } from 'src/infrastructure/github-adapter/mapper/github.repository.mapper';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { GitlabRepositoryMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.repository.mapper';

@Injectable()
export default class GitlabAdapter implements GitlabAdapterPort {
  constructor(private gitlabHttpClient: GitlabHttpClient) {}
  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let gitlabRepositoriesForUserDTO =
      await this.gitlabHttpClient.getRepositoriesForUser(user, page, perPage);
    let alreadyCollectedRepositoriesDTO = gitlabRepositoriesForUserDTO;

    while (gitlabRepositoriesForUserDTO.length === perPage) {
      page += 1;
      gitlabRepositoriesForUserDTO =
        await this.gitlabHttpClient.getRepositoriesForUser(user, page, perPage);

      alreadyCollectedRepositoriesDTO = alreadyCollectedRepositoriesDTO.concat(
        gitlabRepositoriesForUserDTO,
      );
    }

    if (alreadyCollectedRepositoriesDTO.length === 0) {
      const authenticatedUser =
        await this.gitlabHttpClient.getAuthenticatedUser(user);
      return [
        GitlabOrganizationMapper.gitlabUserDtoToDomain(
          plainToInstance(GitlabAuthenticatedUserDTO, authenticatedUser),
        ),
      ];
    }

    const gitlabOrganizationsDTO = alreadyCollectedRepositoriesDTO.map(
      (repositoryDTO) =>
        plainToInstance(GitlabRepositoryDTO, repositoryDTO).owner,
    );
    return GitlabOrganizationMapper.dtoToDomains(
      uniqBy(gitlabOrganizationsDTO, 'id'),
    );
  }
  async getRepositories(user: User): Promise<VcsRepository[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubRepositoriesForOrganizationDTO =
      await this.gitlabHttpClient.getRepositoriesForUser(user, page, perPage);
    let alreadyCollectedRepositoriesDTO = githubRepositoriesForOrganizationDTO;
    while (githubRepositoriesForOrganizationDTO.length === perPage) {
      page += 1;
      githubRepositoriesForOrganizationDTO =
        await this.gitlabHttpClient.getRepositoriesForUser(user, page, perPage);
      alreadyCollectedRepositoriesDTO = alreadyCollectedRepositoriesDTO.concat(
        githubRepositoriesForOrganizationDTO,
      );
    }
    return GitlabRepositoryMapper.dtoToDomains(
      alreadyCollectedRepositoriesDTO.map((repositoryDTO) =>
        plainToInstance(GitlabRepositoryDTO, repositoryDTO),
      ),
    );
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined> {
    const gitlabRepository = await this.gitlabHttpClient.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!gitlabRepository) {
      return undefined;
    }

    return GitlabRepositoryMapper.dtoToDomain(
      plainToInstance(GitlabRepositoryDTO, gitlabRepository),
    );
  }
}
