import User from 'src/domain/model/user/user.model';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { config } from 'symeo-js';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';
import { GithubUserPermissionDTO } from 'src/infrastructure/github-adapter/dto/github.user.permission.dto';
import { AxiosError, AxiosInstance } from 'axios';
import { GithubFileDTO } from 'src/infrastructure/github-adapter/dto/github.file.dto';

export class GithubHttpClient {
  constructor(
    private vcsAccessTokenStorage: VCSAccessTokenStorage,
    private client: AxiosInstance,
  ) {}

  async getRepositoriesForUser(
    user: User,
    page: number,
    perPage: number,
  ): Promise<GithubRepositoryDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url = config.vcsProvider.github.apiUrl + 'user/repos';
    const response = await this.client.get(url, {
      params: {
        page: page,
        per_page: perPage,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getAuthenticatedUser(user: User): Promise<GithubAuthenticatedUserDTO> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);

    const url = config.vcsProvider.github.apiUrl + 'user';
    const response = await this.client.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<GithubRepositoryDTO | undefined> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl + `repositories/${repositoryVcsId}`;

    try {
      const response = await this.client.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return undefined;
      }
      throw exception;
    }
  }

  async getBranchesByRepositoryId(
    user: User,
    repositoryVcsId: number,
    page: number,
    perPage: number,
  ): Promise<GithubBranchDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryVcsId}/branches`;
    try {
      const response = await this.client.get(url, {
        params: {
          page: page,
          per_page: perPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return [];
      }
      throw exception;
    }
  }

  async getFilesByRepositoryIdAndBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<GithubFileDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryVcsId}/git/trees/${branch}?recursive=true`;
    try {
      const response = await this.client.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.tree;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return [];
      }
      throw exception;
    }
  }

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl + `repositories/${repositoryVcsId}`;
    try {
      const response = await this.client.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return false;
      }

      throw exception;
    }
  }

  async checkFileExistsOnBranch(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/contents/${filePath}`;
    try {
      const response = await this.client.get(url, {
        params: {
          ref: branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return false;
      }

      throw exception;
    }
  }

  async getFileContent(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/contents/${filePath}`;
    try {
      const response = await this.client.get(url, {
        params: {
          ref: branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const content = (response.data as { content?: string }).content;
      const encoding = (response.data as { encoding: BufferEncoding }).encoding;

      if (!content) {
        return undefined;
      }

      const buffer = Buffer.from(content, encoding);

      return buffer.toString();
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return undefined;
      }

      throw exception;
    }
  }

  async getCollaboratorsForRepository(
    user: User,
    repositoryId: number,
    page: number,
    perPage: number,
  ): Promise<GithubCollaboratorDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/collaborators`;

    try {
      const response = await this.client.get(url, {
        params: {
          page: page,
          per_page: perPage,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return [];
      }
      throw exception;
    }
  }

  async getUserRepositoryPermission(
    user: User,
    repositoryId: number,
  ): Promise<GithubUserPermissionDTO | undefined> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/collaborators/${user.username}/permission`;
    try {
      const response = await this.client.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (exception) {
      if (
        (exception as AxiosError).response?.status &&
        (exception as AxiosError).response?.status === 404
      ) {
        return undefined;
      }
      throw exception;
    }
  }
}
