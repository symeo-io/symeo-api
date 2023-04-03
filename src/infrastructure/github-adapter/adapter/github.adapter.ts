import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { config } from '@symeo-sdk';
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
import { Injectable } from '@nestjs/common';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { plainToInstance } from 'class-transformer';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';
import { GithubUserPermissionDTO } from 'src/infrastructure/github-adapter/dto/github.user.permission.dto';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

@Injectable()
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
      plainToInstance(GithubRepositoryDTO, gitHubRepository),
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
    return GithubBranchMapper.dtoToDomains(
      alreadyCollectedBranchesDTO.map((branchDTO) =>
        plainToInstance(GithubBranchDTO, branchDTO),
      ),
    );
  }

  async getEnvFilesForRepositoryIdAndBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<EnvFile[]> {
    const files = await this.githubHttpClient.getFilesByRepositoryIdAndBranch(
      user,
      repositoryVcsId,
      branch,
    );
    const rawEnvFiles = files.filter(
      (file) => file.type === 'blob' && this.isEnvFile(file.path),
    );
    const envFilesContents = await Promise.all(
      rawEnvFiles.map((rawEnvFile) =>
        this.githubHttpClient.getFileContent(
          user,
          repositoryVcsId,
          rawEnvFile.path,
          branch,
        ),
      ),
    );
    const envFiles: EnvFile[] = [];

    for (let i = 0; i < rawEnvFiles.length; i++) {
      envFiles.push(
        new EnvFile(rawEnvFiles[i].path, envFilesContents[i] ?? ''),
      );
    }

    return envFiles;
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
    return GithubRepositoryMapper.dtoToDomains(
      alreadyCollectedRepositoriesDTO.map((repositoryDTO) =>
        plainToInstance(GithubRepositoryDTO, repositoryDTO),
      ),
    );
  }

  async checkFileExistsOnBranch(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    return await this.githubHttpClient.checkFileExistsOnBranch(
      user,
      repositoryVcsId,
      filePath,
      branch,
    );
  }

  async getFileContent(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    return await this.githubHttpClient.getFileContent(
      user,
      repositoryVcsId,
      filePath,
      branch,
    );
  }

  async getCollaboratorsForRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsUser[]> {
    let page = 1;
    const perPage = config.vcsProvider.paginationLength;
    let githubCollaboratorsDTO =
      await this.githubHttpClient.getCollaboratorsForRepository(
        user,
        repositoryVcsId,
        page,
        perPage,
      );
    let alreadyCollectedCollaboratorsDTO = githubCollaboratorsDTO;
    while (githubCollaboratorsDTO.length === perPage) {
      page += 1;
      githubCollaboratorsDTO =
        await this.githubHttpClient.getCollaboratorsForRepository(
          user,
          repositoryVcsId,
          page,
          perPage,
        );
      alreadyCollectedCollaboratorsDTO =
        alreadyCollectedCollaboratorsDTO.concat(githubCollaboratorsDTO);
    }

    return GithubCollaboratorsMapper.dtoToDomains(
      alreadyCollectedCollaboratorsDTO.map((collaboratorDTO) =>
        plainToInstance(GithubCollaboratorDTO, collaboratorDTO),
      ),
    );
  }

  async getUserRepositoryRole(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepositoryRole | undefined> {
    const repositoryPermission =
      await this.githubHttpClient.getUserRepositoryPermission(
        user,
        repositoryVcsId,
      );

    if (!repositoryPermission) {
      return undefined;
    }

    return plainToInstance(GithubUserPermissionDTO, repositoryPermission)
      .roleName as VcsRepositoryRole;
  }

  async commitFileToRepositoryBranch(
    user: User,
    repositoryId: number,
    branch: string,
    filePath: string,
    fileContent: string,
    commitMessage: string,
  ): Promise<void> {
    const branchData = await this.githubHttpClient.getRepositoryBranch(
      user,
      repositoryId,
      branch,
    );

    if (!branchData) {
      throw new SymeoException(
        `Error when committing file to repository ${repositoryId}, unknown branch ${branch}`,
        SymeoExceptionCode.COMMITTING_FILE_ERROR,
      );
    }

    const blob = await this.githubHttpClient.createBlobForRepository(
      user,
      repositoryId,
      fileContent,
    );
    const tree = await this.githubHttpClient.createTreeForFileAndRepository(
      user,
      repositoryId,
      branchData.commit.sha,
      filePath,
      blob.sha,
    );
    const commit = await this.githubHttpClient.createCommitForRepository(
      user,
      repositoryId,
      branchData.commit.sha,
      tree.sha,
      commitMessage,
    );
    await this.githubHttpClient.updateBranchReferenceForRepository(
      user,
      repositoryId,
      branch,
      commit.sha,
    );
  }

  private isEnvFile(path: string): boolean {
    return !!path.match(/^.*\/.env[^\/]*$/) || !!path.match(/^.env[^\/]*$/);
  }
}
