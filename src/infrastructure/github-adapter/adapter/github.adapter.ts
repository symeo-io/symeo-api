import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { config } from 'symeo-js/config';
import { GithubOrganizationMapper } from 'src/infrastructure/github-adapter/mapper/github.organization.mapper';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { GithubRepositoryMapper } from 'src/infrastructure/github-adapter/mapper/github.repository.mapper';
import { uniqBy } from 'lodash';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { GithubBranchMapper } from 'src/infrastructure/github-adapter/mapper/github.branch.mapper';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { GithubCollaboratorsMapper } from 'src/infrastructure/github-adapter/mapper/github.collaborators.mapper';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubRepositoriesForUserDTO =
      await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);
    let alreadyCollectedRepositoriesDTO = githubRepositoriesForUserDTO;

    while (githubRepositoriesForUserDTO.length === perPage) {
      page += 1;
      githubRepositoriesForUserDTO =
        await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);

      alreadyCollectedRepositoriesDTO = alreadyCollectedRepositoriesDTO.concat(
        githubRepositoriesForUserDTO,
      );
    }

    if (alreadyCollectedRepositoriesDTO.length === 0) {
      return [
        GithubOrganizationMapper.githubUserDtoToDomain(
          await this.githubHttpClient.getAuthenticatedUser(user),
        ),
      ];
    }

    const gitHubOrganizationsDTO = alreadyCollectedRepositoriesDTO.map(
      (repository) => repository.owner,
    );
    return GithubOrganizationMapper.dtoToDomains(
      uniqBy(gitHubOrganizationsDTO, 'id'),
    );
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined> {
    const gitHubRepository = await this.githubHttpClient.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!gitHubRepository) {
      return undefined;
    }

    return GithubRepositoryMapper.dtoToDomain(
      gitHubRepository as RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data'][0],
    );
  }

  async getBranchByRepositoryId(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsBranch[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubBranchesDTO =
      await this.githubHttpClient.getBranchesByRepositoryId(
        user,
        repositoryVcsId,
        page,
        perPage,
      );
    let alreadyCollectedBranchesDTO = githubBranchesDTO;

    while (githubBranchesDTO.length === perPage) {
      page += 1;
      githubBranchesDTO = await this.githubHttpClient.getBranchesByRepositoryId(
        user,
        repositoryVcsId,
        page,
        perPage,
      );

      alreadyCollectedBranchesDTO =
        alreadyCollectedBranchesDTO.concat(githubBranchesDTO);
    }
    return GithubBranchMapper.dtoToDomains(alreadyCollectedBranchesDTO);
  }

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    return this.githubHttpClient.hasAccessToRepository(user, repositoryVcsId);
  }

  async getRepositories(user: User): Promise<VcsRepository[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let githubRepositoriesForOrganizationDTO =
      await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);
    let alreadyCollectedRepositoriesDTO = githubRepositoriesForOrganizationDTO;

    while (githubRepositoriesForOrganizationDTO.length === perPage) {
      page += 1;
      githubRepositoriesForOrganizationDTO =
        await this.githubHttpClient.getRepositoriesForUser(user, page, perPage);

      alreadyCollectedRepositoriesDTO = alreadyCollectedRepositoriesDTO.concat(
        githubRepositoriesForOrganizationDTO,
      );
    }

    return GithubRepositoryMapper.dtoToDomains(alreadyCollectedRepositoriesDTO);
  }

  async checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    return await this.githubHttpClient.checkFileExistsOnBranch(
      user,
      repositoryOwnerName,
      repositoryName,
      filePath,
      branch,
    );
  }

  async getFileContent(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    return await this.githubHttpClient.getFileContent(
      user,
      repositoryOwnerName,
      repositoryName,
      filePath,
      branch,
    );
  }

  async getCollaboratorsForRepository(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
  ): Promise<VcsUser[]> {
    let page = 1;
    const perPage = config.vcsProvider.paginationLength;
    let githubCollaboratorsDTO =
      await this.githubHttpClient.getCollaboratorsForRepository(
        user,
        repositoryOwnerName,
        repositoryName,
        page,
        perPage,
      );
    let alreadyCollectedCollaboratorsDTO = githubCollaboratorsDTO;
    while (githubCollaboratorsDTO.length === perPage) {
      page += 1;
      githubCollaboratorsDTO =
        await this.githubHttpClient.getCollaboratorsForRepository(
          user,
          repositoryOwnerName,
          repositoryName,
          page,
          perPage,
        );
      alreadyCollectedCollaboratorsDTO =
        alreadyCollectedCollaboratorsDTO.concat(githubCollaboratorsDTO);
    }

    return GithubCollaboratorsMapper.dtoToDomains(
      alreadyCollectedCollaboratorsDTO,
    );
  }

  async getUserRepositoryRole(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
  ): Promise<VcsRepositoryRole | undefined> {
    const repositoryPermission =
      await this.githubHttpClient.getUserRepositoryPermission(
        user,
        repositoryOwnerName,
        repositoryName,
      );

    if (!repositoryPermission) {
      return undefined;
    }

    return repositoryPermission.role_name as VcsRepositoryRole;
  }
}
