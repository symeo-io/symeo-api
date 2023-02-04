import User from '../../domain/model/user.model';
import { Octokit } from '@octokit/rest';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export class GithubHttpClient {
  constructor(
    private vcsAccessTokenStorage: VCSAccessTokenStorage,
    private client: Octokit,
  ) {}

  async getRepositoriesForUser(
    user: User,
    page: number,
    perPage: number,
  ): Promise<
    RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response']['data']
  > {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);
    const response = await this.client.rest.repos.listForAuthenticatedUser({
      page: page,
      per_page: perPage,
      headers: { Authorization: `token ${token}` },
    });

    return response.data;
  }

  async getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<
    RestEndpointMethodTypes['repos']['get']['response']['data'] | undefined
  > {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);

    try {
      const response = await this.client.request('GET /repositories/{id}', {
        id: repositoryVcsId,
        headers: { Authorization: `token ${token}` },
      });

      return response.data;
    } catch (e) {
      if ((e as any).status && (e as any).status === 404) {
        return undefined;
      }

      throw e;
    }
  }

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(user);

    try {
      const response = await this.client.request('GET /repositories/{id}', {
        id: repositoryVcsId,
        headers: { Authorization: `token ${token}` },
      });

      return response.status === 200;
    } catch (e) {
      if ((e as any).status && (e as any).status === 404) {
        return false;
      }

      throw e;
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

    try {
      const response = await this.client.repos.getContent({
        owner: repositoryOwnerName,
        repo: repositoryName,
        path: filePath,
        ref: branch,
        headers: { Authorization: `token ${token}` },
      });

      return response.status === 200;
    } catch (e) {
      if ((e as any).status && (e as any).status === 404) {
        return false;
      }

      throw e;
    }
  }
}
