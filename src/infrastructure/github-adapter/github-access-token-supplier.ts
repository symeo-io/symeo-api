import User from '../../domain/model/user/user.model';
import VCSAccessTokenStoragePort from '../../domain/port/out/vcs-access-token.storage.port';
import VcsAccessToken from '../../domain/model/vcs/vcs.access-token.model';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';
import { AuthenticationProviderPort } from '../../domain/port/out/authentication-provider.port';

export class GithubAccessTokenSupplier {
  constructor(
    private vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    private authenticationProviderPort: AuthenticationProviderPort,
  ) {}

  async getGithubAccessToken(user: User): Promise<string | undefined> {
    let githubAccessToken = await this.vcsAccessTokenStoragePort.findByUser(
      user,
    );

    if (!githubAccessToken) {
      const authenticationProviderUser =
        await this.authenticationProviderPort.getUser(user, VCSProvider.GitHub);

      if (authenticationProviderUser) {
        githubAccessToken = new VcsAccessToken(
          VCSProvider.GitHub,
          user.id,
          user.accessTokenExpiration,
          authenticationProviderUser.accessToken,
          null,
          null,
        );
        await this.vcsAccessTokenStoragePort.save(githubAccessToken);
        return githubAccessToken.accessToken;
      }
    }

    return (githubAccessToken as VcsAccessToken).accessToken;
  }
}
