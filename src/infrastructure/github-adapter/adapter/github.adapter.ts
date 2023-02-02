import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { config } from 'symeo/config';
import { GithubOrganizationMapper } from 'src/infrastructure/github-adapter/mapper/github.organization.mapper';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import User from 'src/domain/model/user.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { GithubRepositoryMapper } from 'src/infrastructure/github-adapter/mapper/github.repository.mapper';
import { uniqBy } from 'lodash';

export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubRepositoriesForUserDTO =
      await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);
    let alreadyCollectedOrganizationsDTO = githubRepositoriesForUserDTO;

    while (githubRepositoriesForUserDTO.length === perPage) {
      page += 1;
      githubRepositoriesForUserDTO =
        await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);

      alreadyCollectedOrganizationsDTO =
        alreadyCollectedOrganizationsDTO.concat(githubRepositoriesForUserDTO);
    }

    return GithubOrganizationMapper.dtoToDomains(
      uniqBy(alreadyCollectedOrganizationsDTO, 'id'),
    );
  }

  async getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubRepositoriesForOrganizationDTO =
      await this.githubHttpClient.getRepositoriesForOrganization(
        user,
        organizationName,
        page,
        perPage,
      );
    let alreadyCollectedRepositoriesDTO = githubRepositoriesForOrganizationDTO;

    while (githubRepositoriesForOrganizationDTO.length === perPage) {
      page += 1;
      githubRepositoriesForOrganizationDTO =
        await this.githubHttpClient.getRepositoriesForOrganization(
          user,
          organizationName,
          page,
          perPage,
        );

      alreadyCollectedRepositoriesDTO = alreadyCollectedRepositoriesDTO.concat(
        githubRepositoriesForOrganizationDTO,
      );
    }
    return GithubRepositoryMapper.dtoToDomains(alreadyCollectedRepositoriesDTO);
  }
}
