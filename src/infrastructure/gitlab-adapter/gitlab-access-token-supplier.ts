import User from '../../domain/model/user/user.model';
import VcsAccessToken from '../../domain/model/vcs/vcs.access-token.model';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';
import VCSAccessTokenStoragePort from '../../domain/port/out/vcs-access-token.storage.port';
import { Auth0Client } from '../auth0-adapter/auth0.client';
import { GitlabHttpClient } from './gitlab.http.client';

export class GitlabAccessTokenSupplier {
  constructor(
    private vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    private auth0Client: Auth0Client,
    private gitlabHttpClient: GitlabHttpClient,
  ) {}

  public async getGitlabAccessToken(user: User): Promise<string | undefined> {
    const persistedAccessToken =
      await this.vcsAccessTokenStoragePort.findByUser(user);

    if (!persistedAccessToken) {
      const userData = await this.auth0Client.client.getUser({
        id: user.id,
      });
      const vcsIdentity = userData?.identities?.find(
        (identity) => identity.connection === 'gitlab',
      );

      if (vcsIdentity && vcsIdentity.access_token) {
        const vcsAccessToken = new VcsAccessToken(
          VCSProvider.Gitlab,
          user.id,
          user.accessTokenExpiration,
          vcsIdentity.access_token,
          user.accessTokenExpiration + 3600,
          // @ts-ignore
          vcsIdentity?.refresh_token,
        );
        await this.vcsAccessTokenStoragePort.save(vcsAccessToken);
        return vcsAccessToken.accessToken;
      }
    }

    if (!!persistedAccessToken && this.isTokenExpired(persistedAccessToken)) {
      const refreshToken = persistedAccessToken.refreshToken;
      const newTokens = await this.gitlabHttpClient.refreshToken(refreshToken);

      const newVcsAccessToken = new VcsAccessToken(
        VCSProvider.Gitlab,
        user.id,
        user.accessTokenExpiration,
        newTokens?.data.access_token,
        Date.now() + newTokens?.data.expires_in,
        newTokens?.data.refresh_token,
      );
      await this.vcsAccessTokenStoragePort.save(newVcsAccessToken);
      return newVcsAccessToken.accessToken;
    }

    return persistedAccessToken?.accessToken;
  }

  private isTokenExpired(vcsAccessToken: VcsAccessToken): boolean {
    return vcsAccessToken.expirationDate
      ? Date.now() > vcsAccessToken.expirationDate
      : true;
  }
}
