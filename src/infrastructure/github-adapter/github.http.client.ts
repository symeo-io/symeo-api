import User from '../../domain/model/user.model';
import { Octokit } from '@octokit/rest';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export class GithubHttpClient {
  constructor(private vcsAccessTokenStorage: VCSAccessTokenStorage) {}

  async getOrganizations(
    user: User,
  ): Promise<
    RestEndpointMethodTypes['orgs']['listForAuthenticatedUser']['response']['data']
  > {
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(
      user.id,
    );
    const client = new Octokit({ auth: token });
    const response = await client.rest.orgs.listForAuthenticatedUser();

    return response.data;
  }
}
