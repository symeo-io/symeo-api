import User from '../../domain/model/user/user.model';
import VCSAccessTokenStoragePort from '../../domain/port/out/vcs-access-token.storage.port';
import VcsAccessToken from '../../domain/model/vcs/vcs.access-token.model';
import { Auth0Client } from '../auth0-adapter/auth0.client';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';

export class GithubAccessTokenSupplier {
  constructor(
    private vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    private auth0Client: Auth0Client,
  ) {}

  async getGithubAccessToken(user: User): Promise<string | undefined> {
    let githubAccessToken = await this.vcsAccessTokenStoragePort.findByUser(
      user,
    );

    if (!githubAccessToken) {
      // TODO : créer un port identity-provider
      // TODO : dans l'adapteur auth0 mapper sur un object du domain
      // TODO : github et gitlab ne doivent pas voir Auth0

      const auth0User = await this.auth0Client.client.getUser({
        id: user.id,
      });
      const vcsIdentity = auth0User?.identities?.find(
        (identity) => identity.connection === 'github',
      );

      if (vcsIdentity && vcsIdentity.access_token) {
        githubAccessToken = new VcsAccessToken(
          VCSProvider.GitHub,
          user.id,
          user.accessTokenExpiration,
          vcsIdentity.access_token,
          null,
          null,
        );
        await this.vcsAccessTokenStoragePort.save(githubAccessToken);
        return githubAccessToken.accessToken;
      }
    }

    return githubAccessToken?.accessToken;
  }
}
