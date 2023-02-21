import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import User from 'src/domain/model/user.model';
import { User as Auth0User } from 'auth0';

export class VCSAccessTokenAdapter implements VCSAccessTokenStorage {
  private cache: Record<
    string,
    Record<string, Promise<Auth0User> | undefined>
  > = {};
  constructor(private auth0Client: Auth0Client) {}

  async getGitHubAccessToken(user: User): Promise<string | undefined> {
    if (
      !this.cache[user.id] ||
      !this.cache[user.id][user.accessTokenExpiration]
    ) {
      this.cache[user.id] = {
        [user.accessTokenExpiration]: this.auth0Client.client.getUser({
          id: user.id,
        }),
      };
    }

    const userData = await this.cache[user.id][user.accessTokenExpiration];
    const githubIdentity = userData?.identities?.find(
      (identity) => identity.provider === 'github',
    );

    return githubIdentity?.access_token;
  }
}
