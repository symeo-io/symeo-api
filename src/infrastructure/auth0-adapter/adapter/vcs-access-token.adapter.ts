import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import User from 'src/domain/model/user.model';

export class VCSAccessTokenAdapter implements VCSAccessTokenStorage {
  private cache: Record<string, Record<string, string | undefined>> = {};
  constructor(private auth0Client: Auth0Client) {}

  async getGitHubAccessToken(user: User): Promise<string | undefined> {
    if (
      this.cache[user.id] &&
      this.cache[user.id][user.accessTokenExpiration]
    ) {
      return this.cache[user.id][user.accessTokenExpiration];
    }

    const userData = await this.auth0Client.client.getUser({ id: user.id });
    const githubIdentity = userData.identities?.find(
      (identity) => identity.provider === 'github',
    );

    this.cache[user.id] = {
      [user.accessTokenExpiration]: githubIdentity?.access_token,
    };

    return githubIdentity?.access_token;
  }
}
