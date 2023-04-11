import User from '../../domain/model/user/user.model';
import VcsAccessToken from '../../domain/model/vcs/vcs.access-token.model';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';
import VCSAccessTokenStoragePort from '../../domain/port/out/vcs-access-token.storage.port';
import { Auth0Provider } from '../auth0-adapter/auth0.client';
import { GitlabAccessTokenHttpClient } from './gitlab-access-token.http.client';
import { Identity } from 'auth0';

export type IdentityWithRefreshToken = Identity & {
  refresh_token?: string;
};

export class GitlabAccessTokenSupplier {
  constructor(
    private vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    private auth0Client: Auth0Provider,
    private gitlabAccessTokenHttpClient: GitlabAccessTokenHttpClient,
  ) {}

  public async getGitlabAccessToken(
    user: User,
    maxTry: number,
    retryCount = 1,
  ): Promise<string | undefined> {
    try {
      const persistedAccessToken =
        await this.vcsAccessTokenStoragePort.findByUser(user);

      if (!persistedAccessToken) {
        const gitlabAccessToken = await this.getGitlabAccessTokenFromAuth0(
          user,
        );
        if (gitlabAccessToken) {
          await this.vcsAccessTokenStoragePort.save(gitlabAccessToken);
          return gitlabAccessToken.accessToken;
        }
      }

      if (this.isTokenExpired(persistedAccessToken as VcsAccessToken)) {
        const refreshToken = (persistedAccessToken as VcsAccessToken)
          .refreshToken;
        const newTokens = await this.gitlabAccessTokenHttpClient.refreshToken(
          refreshToken,
        );
        const newVcsAccessToken = new VcsAccessToken(
          VCSProvider.Gitlab,
          user.id,
          user.accessTokenExpiration,
          newTokens?.data.access_token,
          Math.round(Date.now() / 1000) + newTokens?.data.expires_in,
          newTokens?.data.refresh_token,
        );
        await this.vcsAccessTokenStoragePort.save(newVcsAccessToken);
        return newVcsAccessToken.accessToken;
      }
      return persistedAccessToken?.accessToken;
    } catch (error) {
      if (retryCount > maxTry) {
        console.log(
          `All ${maxTry} retry attempts exhausted while trying to retrieve gitlab access token for user with userId ${user.id}`,
        );
        throw error;
      }
      return this.getGitlabAccessToken(user, maxTry, retryCount + 1);
    }
  }

  private isTokenExpired(vcsAccessToken: VcsAccessToken): boolean {
    return vcsAccessToken.expirationDate
      ? Date.now() > vcsAccessToken.expirationDate * 1000
      : true;
  }

  private async getGitlabAccessTokenFromAuth0(
    user: User,
  ): Promise<VcsAccessToken | undefined> {
    const userData = await this.auth0Client.client.getUser({
      id: user.id,
    });
    const identities = userData?.identities as
      | IdentityWithRefreshToken[]
      | undefined;
    const vcsIdentity = identities?.find(
      (identity) => identity.connection === 'gitlab',
    );

    if (vcsIdentity && vcsIdentity.access_token) {
      return new VcsAccessToken(
        VCSProvider.Gitlab,
        user.id,
        user.accessTokenExpiration,
        vcsIdentity.access_token,
        user.accessTokenExpiration + 3600,
        vcsIdentity?.refresh_token ?? null,
      );
    }
  }
}
