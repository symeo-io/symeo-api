import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { config } from 'symeo/config';
import { GithubOrganizationMapper } from 'src/infrastructure/github-adapter/mapper/github.organization.mapper';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import User from 'src/domain/model/user.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { GithubRepositoryMapper } from 'src/infrastructure/github-adapter/mapper/github.repository.mapper';

export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    const alreadyCollectedOrganizationsDTO: Array<any> = [];
    let githubRepositoriesForUserDTO: Array<any> =
      await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);
    this.addRepositoriesForUserDTOToAlreadyCollectedOrganizationsDTO(
      githubRepositoriesForUserDTO,
      alreadyCollectedOrganizationsDTO,
    );
    while (githubRepositoriesForUserDTO.length === perPage) {
      page += 1;
      githubRepositoriesForUserDTO =
        await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);
      this.addRepositoriesForUserDTOToAlreadyCollectedOrganizationsDTO(
        githubRepositoriesForUserDTO,
        alreadyCollectedOrganizationsDTO,
      );
    }
    const vcsOrganizations: VcsOrganization[] =
      GithubOrganizationMapper.dtoToDomains(alreadyCollectedOrganizationsDTO);
    return [
      ...new Map(
        vcsOrganizations.map((vcsOrganization) => [
          vcsOrganization.vcsId,
          vcsOrganization,
        ]),
      ).values(),
    ];
  }

  private addRepositoriesForUserDTOToAlreadyCollectedOrganizationsDTO(
    githubRepositoriesForUserDTO: Array<any>,
    alreadyCollectedRepositoriesDTO: Array<any>,
  ) {
    githubRepositoriesForUserDTO.map((organizationDTO) =>
      alreadyCollectedRepositoriesDTO.push(organizationDTO),
    );
  }

  async getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    const alreadyCollectedRepositoriesDTO: Array<any> = [];
    let githubRepositoriesForOrganizationDTO: Array<any> =
      await this.githubHttpClient.getRepositoriesForOrganization(
        user,
        organizationName,
        page,
        perPage,
      );
    this.addRepositoriesForOrganizationDTOToAlreadyCollectedRepositoriesDTO(
      githubRepositoriesForOrganizationDTO,
      alreadyCollectedRepositoriesDTO,
    );

    while (githubRepositoriesForOrganizationDTO.length === perPage) {
      page += 1;
      githubRepositoriesForOrganizationDTO =
        await this.githubHttpClient.getRepositoriesForOrganization(
          user,
          organizationName,
          page,
          perPage,
        );
      this.addRepositoriesForOrganizationDTOToAlreadyCollectedRepositoriesDTO(
        githubRepositoriesForOrganizationDTO,
        alreadyCollectedRepositoriesDTO,
      );
    }
    return GithubRepositoryMapper.dtoToDomains(alreadyCollectedRepositoriesDTO);
  }

  private addRepositoriesForOrganizationDTOToAlreadyCollectedRepositoriesDTO(
    githubRepositoriesForOrganizationDTO: Array<any>,
    alreadyCollectedRepositoriesDTO: Array<any>,
  ) {
    githubRepositoriesForOrganizationDTO.map((RepositoryForUserDTO) =>
      alreadyCollectedRepositoriesDTO.push(RepositoryForUserDTO),
    );
  }
}
