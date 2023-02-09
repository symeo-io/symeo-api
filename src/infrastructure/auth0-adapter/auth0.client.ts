import { ManagementClient } from 'auth0';
import { config } from '@symeo-io/symeo/config';

export class Auth0Client {
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
}
