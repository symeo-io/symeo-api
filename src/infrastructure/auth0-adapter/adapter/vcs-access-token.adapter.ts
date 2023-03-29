import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import User from 'src/domain/model/user/user.model';
import { User as Auth0User } from 'auth0';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export class VCSAccessTokenAdapter implements VCSAccessTokenStorage {
  private cache: Record<
    string,
    Record<string, Promise<Auth0User> | undefined>
  > = {};
  constructor(private auth0Client: Auth0Client) {}

  async getAccessToken(user: User): Promise<string | undefined> {
    let auth0Sub: string;
    let connection: string;

    if (user.provider === VCSProvider.GitHub) {
      auth0Sub = user.id;
      connection = 'github';
    } else {
      auth0Sub = 'oauth2|' + user.id;
      connection = 'gitlab';
    }

    if (
      !this.cache[user.id] ||
      !this.cache[user.id][user.accessTokenExpiration]
    ) {
      this.cache[user.id] = {
        [user.accessTokenExpiration]: this.auth0Client.client.getUser({
          id: auth0Sub,
        }),
      };
    }

    const userData = await this.cache[user.id][user.accessTokenExpiration];
    const githubIdentity = userData?.identities?.find(
      (identity) => identity.connection === connection,
    );

    return githubIdentity?.access_token;
  }
}
