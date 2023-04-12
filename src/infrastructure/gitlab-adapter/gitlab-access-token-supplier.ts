import User from '../../domain/model/user/user.model';
import VcsAccessToken from '../../domain/model/vcs/vcs.access-token.model';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';
import VCSAccessTokenStoragePort from '../../domain/port/out/vcs-access-token.storage.port';
import { GitlabAccessTokenHttpClient } from './gitlab-access-token.http.client';
import { AuthenticationProviderPort } from '../../domain/port/out/authentication-provider.port';
import { SymeoException } from '../../domain/exception/symeo.exception';
import { SymeoExceptionCode } from '../../domain/exception/symeo.exception.code.enum';

export class GitlabAccessTokenSupplier {
  MAX_AMOUNT_OF_RETRY = 3;
  constructor(
    private vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    private authenticationProviderPort: AuthenticationProviderPort,
    private gitlabAccessTokenHttpClient: GitlabAccessTokenHttpClient,
  ) {}

  public async getGitlabAccessToken(
    user: User,
    maxRetry = this.MAX_AMOUNT_OF_RETRY,
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
        if (newTokens) {
          const newVcsAccessToken = new VcsAccessToken(
            VCSProvider.Gitlab,
            user.id,
            user.accessTokenExpiration,
            newTokens.access_token,
            Math.round(Date.now() / 1000) + newTokens.expires_in,
            newTokens.refresh_token,
          );
          await this.vcsAccessTokenStoragePort.save(newVcsAccessToken);
          return newVcsAccessToken.accessToken;
        }
      }
      return (persistedAccessToken as VcsAccessToken).accessToken;
    } catch (error) {
      if (retryCount > maxRetry) {
        throw new SymeoException(
          `All ${maxRetry} retry attempts exhausted while trying to retrieve gitlab access token for user with userId ${user.id}`,
          SymeoExceptionCode.TOKEN_REFRESH_FAILURE,
        );
      }
      return this.getGitlabAccessToken(user, maxRetry, retryCount + 1);
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
    const authenticationProviderUser =
      await this.authenticationProviderPort.getUser(user, VCSProvider.Gitlab);
    if (authenticationProviderUser) {
      return new VcsAccessToken(
        VCSProvider.Gitlab,
        user.id,
        user.accessTokenExpiration,
        authenticationProviderUser.accessToken,
        user.accessTokenExpiration + 3600,
        authenticationProviderUser.refreshToken ?? null,
      );
    }
  }
}
