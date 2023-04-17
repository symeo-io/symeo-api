import User from 'src/domain/model/user/user.model';
import { config } from '@symeo-sdk';
import { GithubRepositoryDTO } from 'src/infrastructure/github-adapter/dto/github.repository.dto';
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import { GithubBranchDTO } from 'src/infrastructure/github-adapter/dto/github.branch.dto';
import { GithubCollaboratorDTO } from 'src/infrastructure/github-adapter/dto/github.collaborator.dto';
import { GithubUserPermissionDTO } from 'src/infrastructure/github-adapter/dto/github.user.permission.dto';
import { AxiosError, AxiosInstance } from 'axios';
import { GithubFileDTO } from 'src/infrastructure/github-adapter/dto/github.file.dto';
import { GithubBlobDTO } from 'src/infrastructure/github-adapter/dto/github.blob.dto';
import { GithubTreeDTO } from 'src/infrastructure/github-adapter/dto/github.tree.dto';
import { GithubCommitDTO } from 'src/infrastructure/github-adapter/dto/github.commit.dto';
import { GithubAccessTokenSupplier } from './github-access-token-supplier';

export class GithubHttpClient {
  constructor(
    private githubAccessTokenSupplier: GithubAccessTokenSupplier,
    private client: AxiosInstance,
  ) {}

  async getRepositoriesForUser(
    user: User,
    page: number,
    perPage: number,
  ): Promise<GithubRepositoryDTO[]> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );

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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
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

  async getRepositoryBranch(
    user: User,
    repositoryId: number,
    branch: string,
  ): Promise<GithubBranchDTO | undefined> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/branches/${branch}`;

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

  async createBlobForRepository(
    user: User,
    repositoryId: number,
    fileContent: string,
  ): Promise<GithubBlobDTO> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/git/blobs`;

    try {
      const response = await this.client.post(
        url,
        {
          content: fileContent,
          encoding: 'utf-8',
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

  async createTreeForFileAndRepository(
    user: User,
    repositoryId: number,
    baseCommitSha: string,
    filePath: string,
    blobSha: string,
  ): Promise<GithubTreeDTO> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/git/trees`;

    try {
      const response = await this.client.post(
        url,
        {
          base_tree: baseCommitSha,
          tree: [
            {
              path: filePath,
              mode: '100644',
              type: 'blob',
              sha: blobSha,
            },
          ],
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

  async createCommitForRepository(
    user: User,
    repositoryId: number,
    baseCommitSha: string,
    treeSha: string,
    commitMessage: string,
  ): Promise<GithubCommitDTO> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/git/commits`;

    try {
      const response = await this.client.post(
        url,
        {
          message: commitMessage,
          author: {
            name: user.username,
            email: user.email,
          },
          parents: [baseCommitSha],
          tree: treeSha,
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

  async updateBranchReferenceForRepository(
    user: User,
    repositoryId: number,
    branch: string,
    commitSha: string,
  ): Promise<void> {
    const token = await this.githubAccessTokenSupplier.getGithubAccessToken(
      user,
    );
    const url =
      config.vcsProvider.github.apiUrl +
      `repositories/${repositoryId}/git/refs/heads/${branch}`;

    try {
      await this.client.post(
        url,
        {
          ref: `refs/heads/${branch}`,
          sha: commitSha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (exception) {
      throw exception;
    }
  }
}
