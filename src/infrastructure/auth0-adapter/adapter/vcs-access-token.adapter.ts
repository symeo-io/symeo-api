import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import User from 'src/domain/model/user/user.model';
import { User as Auth0User } from 'auth0';
import { AxiosInstance } from 'axios';
import { config } from '@symeo-sdk';

export class VCSAccessTokenAdapter implements VCSAccessTokenStorage {
  private cache: Record<
    string,
    Record<string, Promise<Auth0User> | undefined | Auth0User>
  > = {};
  private JWT_TOKEN_EXPIRATION_TIME = 86400;
  private ACCESS_TOKEN_EXPIRATION_TIME = 7200;

  constructor(
    private auth0Client: Auth0Client,
    private axiosClient: AxiosInstance,
  ) {}

  async getAccessToken(user: User): Promise<string | undefined> {
    if (!this.tokenInCache(user)) {
      console.log('TOKEN NOT IN CACHE');
      this.cache[user.id] = {
        [user.accessTokenExpiration]: this.auth0Client.client.getUser({
          id: user.id,
        }),
      };
      const userData = await this.cache[user.id][user.accessTokenExpiration];

      const vcsIdentity = userData?.identities?.find(
        (identity) =>
          identity.connection === 'github' || identity.connection === 'gitlab',
      );
      return vcsIdentity?.access_token;
    }

    const userData = await this.cache[user.id][user.accessTokenExpiration];
    const vcsIdentity = userData?.identities?.find(
      (identity) =>
        identity.connection === 'github' || identity.connection === 'gitlab',
    );

    console.log('ACCESS_TOKEN', vcsIdentity?.access_token);

    if (this.isTokenExpired(user)) {
      console.log('TOKEN IN CACHE AND EXPIRED');
      // @ts-ignore
      const refreshToken = vcsIdentity?.refresh_token;
      const options = {
        method: 'POST',
        url: 'https://gitlab.com/oauth/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.vcsProvider.gitlab.clientId,
          client_secret: config.vcsProvider.gitlab.clientSecret,
          refresh_token: refreshToken,
        }),
      };

      const newTokens = await this.axiosClient.request(options);
      if (vcsIdentity && userData) {
        vcsIdentity.access_token = newTokens.data.access_token;
        // @ts-ignore
        vcsIdentity.refresh_token = newTokens.data.refresh_token;
        userData.identities = [vcsIdentity];
        this.cache[user.id] = {
          [user.accessTokenExpiration]: userData,
        };
      }

      console.log(newTokens.data);

      return newTokens.data.access_token;
    }

    console.log('TOKEN IN CACHE AND NOT EXPIRED');
    console.log('NOW', new Date(Math.round(Date.now())));
    console.log(
      'ACCESS_TOKEN_EXPIRATION_TIME',
      new Date(this.computeAccessTokenExpirationTime(user)),
    );
    console.log('CACHE', await this.cache);

    return vcsIdentity?.access_token;
  }

  private tokenInCache(user: User) {
    return (
      this.cache[user.id] && this.cache[user.id][user.accessTokenExpiration]
    );
  }

  private isTokenExpired(user: User): boolean {
    return true;
    //return Date.now() > this.computeAccessTokenExpirationTime(user);
  }

  private computeAccessTokenExpirationTime(user: User): number {
    return (
      (user.accessTokenExpiration -
        this.JWT_TOKEN_EXPIRATION_TIME +
        this.ACCESS_TOKEN_EXPIRATION_TIME) *
      1000
    );
  }
}
