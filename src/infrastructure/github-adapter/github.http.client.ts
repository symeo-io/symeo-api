import User from 'src/domain/model/user/user.model';
import { Octokit } from '@octokit/rest';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import axios from 'axios';
import { config } from 'symeo-js/config';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';
import { GithubUserPermissionDTO } from 'src/infrastructure/github-adapter/dto/github.user.permission.dto';

export class GithubHttpClient {
  constructor(private vcsAccessTokenStorage: VCSAccessTokenStorage) {}

  async getRepositoriesForUser(
    user: User,
    page: number,
    perPage: number,
  ): Promise<GithubRepositoryDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url = config.vcsProvider.github.apiUrl + 'user/repos';

    const response = await axios.get(url, {
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

    const url = config.vcsProvider.github.apiUrl + 'user/';
    const response = await axios.get(url, {
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
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (exception) {
      if ((exception as any).status && (exception as any).status === 404) {
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
      const response = await axios.get(url, {
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
      if ((exception as any).status && (exception as any).status === 404) {
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
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (exception) {
      if ((exception as any).status && (exception as any).status === 404) {
        return false;
      }

      throw exception;
    }
  }

  async checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repos/${repositoryOwnerName}/${repositoryName}/contents/${filePath}`;
    try {
      const response = await axios.get(url, {
        params: {
          ref: branch,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (exception) {
      if ((exception as any).status && (exception as any).status === 404) {
        return false;
      }

      throw exception;
    }
  }

  async getFileContent(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repos/${repositoryOwnerName}/${repositoryName}/contents/${filePath}`;
    try {
      const response = await axios.get(url, {
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
      if ((exception as any).status && (exception as any).status === 404) {
        return undefined;
      }

      throw exception;
    }
  }

  async getCollaboratorsForRepository(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    page: number,
    perPage: number,
  ): Promise<GithubCollaboratorDTO[]> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repos/${repositoryOwnerName}/${repositoryName}/collaborators`;

    try {
      const response = await axios.get(url, {
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
      if ((exception as any).status && (exception as any).status === 404) {
        return [];
      }
      throw exception;
    }
  }

  async getUserRepositoryPermission(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
  ): Promise<GithubUserPermissionDTO | undefined> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const url =
      config.vcsProvider.github.apiUrl +
      `repos/${repositoryOwnerName}/${repositoryName}/collaborators/${user.username}/permission`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (exception) {
      if ((exception as any).status && (exception as any).status === 404) {
        return undefined;
      }
      throw exception;
    }
  }
}
