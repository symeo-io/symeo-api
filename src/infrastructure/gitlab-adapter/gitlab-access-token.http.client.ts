import { AxiosInstance } from 'axios/index';
import { config } from '@symeo-sdk';

export class GitlabAccessTokenHttpClient {
  constructor(private client: AxiosInstance) {}

  async refreshToken(refreshToken: string | null) {
    if (refreshToken) {
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
      return this.client.request(options);
    }

    return null;
  }
}
