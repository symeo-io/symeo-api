import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { config } from 'symeo-js';
import { GithubOrganizationMapper } from 'src/infrastructure/github-adapter/mapper/github.organization.mapper';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { GithubRepositoryMapper } from 'src/infrastructure/github-adapter/mapper/github.repository.mapper';
import { uniqBy } from 'lodash';
import { GithubBranchMapper } from 'src/infrastructure/github-adapter/mapper/github.branch.mapper';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { GithubCollaboratorsMapper } from 'src/infrastructure/github-adapter/mapper/github.collaborators.mapper';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { Injectable, Logger } from '@nestjs/common';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { plainToInstance } from 'class-transformer';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';
import { GithubUserPermissionDTO } from 'src/infrastructure/github-adapter/dto/github.user.permission.dto';

@Injectable()
export default class GithubAdapter implements GithubAdapterPort {
  constructor(private githubHttpClient: GithubHttpClient) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    const clock = Date.now();
    Logger.log(
      `Starting to fetch Organizations through VcsRepositories on Github for user ${user.id}`,
    );
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
      const authenticatedUser =
        await this.githubHttpClient.getAuthenticatedUser(user);
      return [
        GithubOrganizationMapper.githubUserDtoToDomain(
          plainToInstance(GithubAuthenticatedUserDTO, authenticatedUser),
        ),
      ];
    }

    const gitHubOrganizationsDTO = alreadyCollectedRepositoriesDTO.map(
      (repositoryDTO) =>
        plainToInstance(GithubRepositoryDTO, repositoryDTO).owner,
    );
    Logger.log(
      `Organizations successfully fetched through VcsRepositories from Github for user ${
        user.id
      } - Executed in : ${(Date.now() - clock) / 1000} s`,
    );
    return GithubOrganizationMapper.dtoToDomains(
      uniqBy(gitHubOrganizationsDTO, 'id'),
    );
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined> {
    const clock = Date.now();
    Logger.log(
      `Starting to fetch VcsRepository on Github for vcsRepositoryId ${repositoryVcsId}`,
    );
    const gitHubRepository = await this.githubHttpClient.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!gitHubRepository) {
      return undefined;
    }

    Logger.log(
      `VcsRepository successfully fetched from Github for vcsRepositoryId ${repositoryVcsId} - Executed in : ${
        (Date.now() - clock) / 1000
      } s`,
    );

    return GithubRepositoryMapper.dtoToDomain(
      plainToInstance(GithubRepositoryDTO, gitHubRepository),
    );
  }

  async getBranchByRepositoryId(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsBranch[]> {
    const clock = Date.now();
    Logger.log(
      `Starting to fetch VcsBranches on Github for vcsRepositoryId ${repositoryVcsId}`,
    );
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
    Logger.log(
      `VcsBranches successfully fetched from Github for vcsRepositoryId ${repositoryVcsId} - Executed in : ${
        (Date.now() - clock) / 1000
      } s`,
    );
    return GithubBranchMapper.dtoToDomains(
      alreadyCollectedBranchesDTO.map((branchDTO) =>
        plainToInstance(GithubBranchDTO, branchDTO),
      ),
    );
  }

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    return this.githubHttpClient.hasAccessToRepository(user, repositoryVcsId);
  }

  async getRepositories(user: User): Promise<VcsRepository[]> {
    const clock = Date.now();
    Logger.log(`Starting to fetch repositories on Github for user ${user.id}`);
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
    Logger.log(
      `VcsRepositories successfully fetched from Github for user ${
        user.id
      } - Executed in : ${(Date.now() - clock) / 1000} s`,
    );
    return GithubRepositoryMapper.dtoToDomains(
      alreadyCollectedRepositoriesDTO.map((repositoryDTO) =>
        plainToInstance(GithubRepositoryDTO, repositoryDTO),
      ),
    );
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
    const clock = Date.now();
    Logger.log(
      `Starting to fetch Collaborators on Github for userId ${user.id}, repositoryOwnerName ${repositoryOwnerName} and repositoryName ${repositoryName}`,
    );
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

    Logger.log(
      `Collaborators successfully fetched from Github for userId ${
        user.id
      }, repositoryOwnerName ${repositoryOwnerName} and repositoryName ${repositoryName} - Executed in : ${
        (Date.now() - clock) / 1000
      } s`,
    );

    return GithubCollaboratorsMapper.dtoToDomains(
      alreadyCollectedCollaboratorsDTO.map((collaboratorDTO) =>
        plainToInstance(GithubCollaboratorDTO, collaboratorDTO),
      ),
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

    return plainToInstance(GithubUserPermissionDTO, repositoryPermission)
      .roleName as VcsRepositoryRole;
  }
}
