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
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(
      user.id,
    );
    const response = await this.client.rest.repos.listForAuthenticatedUser({
      page: page,
      per_page: perPage,
      headers: { Authorization: `token ${token}` },
    });

    return response.data;
  }

  async getRepositoriesForOrganization(
    user: User,
    organizationName: string,
    page: number,
    perPage: number,
  ): Promise<
    RestEndpointMethodTypes['repos']['listForOrg']['response']['data']
  > {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(
      user.id,
    );
    const response = await this.client.rest.repos.listForOrg({
      org: organizationName,
      page: page,
      per_page: perPage,
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  }

  async hasAccessToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<boolean> {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(
      user.id,
    );

    const response = await this.client.request('GET /repositories/{id}', {
      id: repositoryVcsId,
      headers: { Authorization: `token ${token}` },
    });

    return response.status === 200;
  }
}
