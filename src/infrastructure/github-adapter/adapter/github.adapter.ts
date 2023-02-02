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
    let githubOrganizationsDTO: Array<any> =
      await this.githubHttpClient.getOrganizations(user, page, perPage);
    this.addOrganizationsDTOToAlreadyCollectedOrganizationsDTO(
      githubOrganizationsDTO,
      alreadyCollectedOrganizationsDTO,
    );
    while (githubOrganizationsDTO.length === perPage) {
      page += 1;
      githubOrganizationsDTO = await this.githubHttpClient.getOrganizations(
        user,
        page,
        perPage,
      );
      this.addOrganizationsDTOToAlreadyCollectedOrganizationsDTO(
        githubOrganizationsDTO,
        alreadyCollectedOrganizationsDTO,
      );
    }
    return GithubOrganizationMapper.dtoToDomain(
      alreadyCollectedOrganizationsDTO,
    );
  }

  private addOrganizationsDTOToAlreadyCollectedOrganizationsDTO(
    organizationsDTO: Array<any>,
    alreadyCollectedOrganizationsDTO: Array<any>,
  ) {
    organizationsDTO.map((organizationDTO) =>
      alreadyCollectedOrganizationsDTO.push(organizationDTO),
    );
  }

  async getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    const alreadyCollectedRepositoriesDTO: Array<any> = [];
    let githubRepositoriesDTO: Array<any> =
      await this.githubHttpClient.getRepositories(
        user,
        organizationName,
        page,
        perPage,
      );
    this.addRepositoriesDTOToAlreadyCollectedRepositoriesDTO(
      githubRepositoriesDTO,
      alreadyCollectedRepositoriesDTO,
    );

    while (githubRepositoriesDTO.length === perPage) {
      page += 1;
      githubRepositoriesDTO = await this.githubHttpClient.getRepositories(
        user,
        organizationName,
        page,
        perPage,
      );
      this.addRepositoriesDTOToAlreadyCollectedRepositoriesDTO(
        githubRepositoriesDTO,
        alreadyCollectedRepositoriesDTO,
      );
    }
    return GithubRepositoryMapper.dtosToDomain(alreadyCollectedRepositoriesDTO);
  }

  private addRepositoriesDTOToAlreadyCollectedRepositoriesDTO(
    githubRepositoriesDTO: Array<any>,
    alreadyCollectedRepositoriesDTO: Array<any>,
  ) {
    githubRepositoriesDTO.map((RepositoryDTO) =>
      alreadyCollectedRepositoriesDTO.push(RepositoryDTO),
    );
  }
}
