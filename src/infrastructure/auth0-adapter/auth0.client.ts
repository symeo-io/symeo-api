import { Identity, ManagementClient } from 'auth0';
import { config } from '@symeo-sdk';
import { AuthenticationProviderPort } from '../../domain/port/out/authentication-provider.port';
import User from '../../domain/model/user/user.model';
import { AuthenticationProviderUser } from '../../domain/model/user/authentication-provider-user.model';
import { VCSProvider } from '../../domain/model/vcs/vcs-provider.enum';

export type IdentityWithRefreshToken = Identity & {
  refresh_token?: string;
};

export class Auth0Provider implements AuthenticationProviderPort {
  public client: ManagementClient;

  constructor() {
    this.client = new ManagementClient({
      domain: config.auth0.domain,
      clientId: config.auth0.clientId,
      clientSecret: config.auth0.clientSecret,
      tokenProvider: {
        enableCache: true,
        cacheTTLInSeconds: 3600,
      },
    });
  }

  async getUser(
    user: User,
    vcsProvider: VCSProvider,
  ): Promise<AuthenticationProviderUser | undefined> {
    const userData = await this.client.getUser({
      id: user.id,
    });
    const identities = userData?.identities as
      | IdentityWithRefreshToken[]
      | undefined;
    const vcsIdentity = identities?.find(
      (identity) => identity.connection === vcsProvider,
    );

    if (vcsIdentity && vcsIdentity.access_token) {
      return new AuthenticationProviderUser(
        user.id,
        vcsIdentity.connection,
        vcsIdentity.access_token,
        vcsIdentity.refresh_token,
      );
    }
  }
}
