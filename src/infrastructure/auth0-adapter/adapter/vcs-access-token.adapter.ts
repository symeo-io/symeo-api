import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';

export class VCSAccessTokenAdapter implements VCSAccessTokenStorage {
  constructor(private auth0Client: Auth0Client) {}

  async getGitHubAccessToken(userId: string): Promise<string | undefined> {
    const userData = await this.auth0Client.client.getUser({ id: userId });
    const githubIdentity = userData.identities?.find(
      (identity) => identity.provider === 'github',
    );

    return githubIdentity?.access_token;
  }
}
