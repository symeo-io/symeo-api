import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { Injectable } from '@nestjs/common';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import { config } from '@symeo-sdk';
import { plainToInstance } from 'class-transformer';
import { orderBy, uniqBy } from 'lodash';
import { GitlabOrganizationMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.organization.mapper';
import { GitlabRepositoryDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.repository.dto';
import { GitlabAuthenticatedUserDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.authenticated.user.dto';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { GitlabRepositoryMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.repository.mapper';
import { GitlabBranchDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.branch.dto';
import { GitlabBranchMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.branch.mapper';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { GitlabUserPermissionDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.user.permission.dto';
import { GitlabAccessLevelMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.access.level.mapper';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { GitlabCollaboratorsMapper } from 'src/infrastructure/gitlab-adapter/mapper/gitlab.collaborators.mapper';
import { GitlabCollaboratorDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.collaborator.dto';
import { GitlabFileDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.file.dto';

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
        plainToInstance(GitlabRepositoryDTO, repositoryDTO).namespace,
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
  async getBranchByRepositoryId(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsBranch[]> {
    let page = 1;
    const perPage: number = config.vcsProvider.paginationLength;
    let gitlabBranchesDTO =
      await this.gitlabHttpClient.getBranchesByRepositoryId(
        user,
        repositoryVcsId,
        page,
        perPage,
      );
    let alreadyCollectedBranchesDTO = gitlabBranchesDTO;

    while (gitlabBranchesDTO.length === perPage) {
      page += 1;
      gitlabBranchesDTO = await this.gitlabHttpClient.getBranchesByRepositoryId(
        user,
        repositoryVcsId,
        page,
        perPage,
      );

      alreadyCollectedBranchesDTO =
        alreadyCollectedBranchesDTO.concat(gitlabBranchesDTO);
    }
    return GitlabBranchMapper.dtoToDomains(
      alreadyCollectedBranchesDTO.map((branchDTO) =>
        plainToInstance(GitlabBranchDTO, branchDTO),
      ),
    );
  }
  async getEnvFilesForRepositoryIdAndBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<EnvFile[]> {
    const files = await this.gitlabHttpClient.getFilesByRepositoryIdAndBranch(
      user,
      repositoryVcsId,
      branch,
    );
    const rawEnvFiles = plainToInstance(
      GitlabFileDTO,
      files.filter((file) => file.type === 'blob' && this.isEnvFile(file.path)),
    );
    const envFilesContents = await Promise.all(
      rawEnvFiles.map((rawEnvFile) =>
        this.gitlabHttpClient.getFileContent(
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
  private isEnvFile(path: string) {
    return !!path.match(/^.*\/.env[^\/]*$/) || !!path.match(/^.env[^\/]*$/);
  }
  async commitFileToRepositoryBranch(
    user: User,
    repositoryId: number,
    branch: string,
    filePath: string,
    fileContent: string,
    commitMessage: string,
  ): Promise<void> {
    const branchData = await this.gitlabHttpClient.getRepositoryBranch(
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

    await this.gitlabHttpClient.createFileForRepository(
      user,
      repositoryId,
      branch,
      fileContent,
      filePath,
      commitMessage,
    );
  }
  async checkFileExistsOnBranch(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    return await this.gitlabHttpClient.checkFileExistsOnBranch(
      user,
      repositoryVcsId,
      filePath,
      branch,
    );
  }
  async getUserRepositoryRole(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepositoryRole | undefined> {
    const repositoryPermission =
      await this.gitlabHttpClient.getUserRepositoryPermission(
        user,
        repositoryVcsId,
      );
    if (!repositoryPermission) {
      return undefined;
    }

    const gitlabPermissionRole =
      GitlabAccessLevelMapper.accessLevelToVcsRepositoryRole(
        plainToInstance(GitlabUserPermissionDTO, repositoryPermission)
          .accessLevel,
      );

    return gitlabPermissionRole as VcsRepositoryRole;
  }

  async getFileContent(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    return await this.gitlabHttpClient.getFileContent(
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
    let gitlabCollaboratorsDTO =
      await this.gitlabHttpClient.getCollaboratorsForRepository(
        user,
        repositoryVcsId,
        page,
        perPage,
      );
    let alreadyCollectedCollaboratorsDTO = gitlabCollaboratorsDTO;
    while (gitlabCollaboratorsDTO.length === perPage) {
      page += 1;
      gitlabCollaboratorsDTO =
        await this.gitlabHttpClient.getCollaboratorsForRepository(
          user,
          repositoryVcsId,
          page,
          perPage,
        );
      alreadyCollectedCollaboratorsDTO =
        alreadyCollectedCollaboratorsDTO.concat(gitlabCollaboratorsDTO);
    }

    const alreadyCollaboratorsSortedByAscendingAccessLevel = orderBy(
      alreadyCollectedCollaboratorsDTO.map((collaboratorDTO) =>
        plainToInstance(GitlabCollaboratorDTO, collaboratorDTO),
      ),
      (collaborator) => collaborator.accessLevel,
      'asc',
    );

    return GitlabCollaboratorsMapper.dtoToDomains(
      uniqBy(alreadyCollaboratorsSortedByAscendingAccessLevel, 'id'),
    );
  }
}
