import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { AxiosError, AxiosInstance } from 'axios';
import User from 'src/domain/model/user/user.model';
import { GitlabRepositoryDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.repository.dto';
import { config } from 'symeo-js';
import { GitlabAuthenticatedUserDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.authenticated.user.dto';
import { GitlabBranchDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.branch.dto';
import { GitlabFileDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.file.dto';
import { GitlabBlobDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.blob.dto';

export class GitlabHttpClient {
  constructor(
    private vcsAccessTokenStorage: VCSAccessTokenStorage,
    private client: AxiosInstance,
  ) {}

  async getRepositoriesForUser(
    user: User,
    page: number,
    perPage: number,
  ): Promise<GitlabRepositoryDTO[]> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url = config.vcsProvider.gitlab.apiUrl + 'projects?membership=true';

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

  async getAuthenticatedUser(user: User): Promise<GitlabAuthenticatedUserDTO> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);

    const url = config.vcsProvider.gitlab.apiUrl + 'user';
    const response = await this.client.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getRepositoryById(user: User, repositoryVcsId: number) {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl + `projects/${repositoryVcsId}`;

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
  ): Promise<GitlabBranchDTO[]> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryVcsId}/repository/branches`;
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
  ): Promise<GitlabFileDTO[]> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryVcsId}/repository/tree?ref=${branch}&recursive=true`;
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
        return [];
      }
      throw exception;
    }
  }

  async getFileContent(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryVcsId}/repository/files/${encodeURIComponent(
        filePath,
      )}`;
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

  async getRepositoryBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<GitlabBranchDTO | undefined> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryVcsId}/repository/branches/${branch}`;
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

  async createFileForRepository(
    user: User,
    repositoryId: number,
    branch: string,
    fileContent: string,
    filePath: string,
    commitMessage: string,
  ): Promise<GitlabBlobDTO> {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryId}/repository/files/${filePath}`;

    try {
      const response = await this.client.post(
        url,
        {
          content: fileContent,
          encoding: 'text',
          commit_message: commitMessage,
          branch: branch,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (exception) {
      throw exception;
    }
  }

  async checkFileExistsOnBranch(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ) {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryVcsId}/repository/files/${encodeURIComponent(
        filePath,
      )}`;
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

  async getUserRepositoryPermission(user: User, repositoryId: number) {
    const token = await this.vcsAccessTokenStorage.getAccessToken(user);
    const url =
      config.vcsProvider.gitlab.apiUrl +
      `projects/${repositoryId}/members/${user.getVcsUserId()}`;
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
