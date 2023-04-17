import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';
import { v4 as uuid } from 'uuid';
import { GithubAccessTokenSupplier } from '../../../src/infrastructure/github-adapter/github-access-token-supplier';

export class FetchGithubAccessTokenMock {
  public spy: SpyInstance | undefined;
  private readonly githubAccessTokenSupplier: GithubAccessTokenSupplier;

  constructor(appClient: AppClient) {
    this.githubAccessTokenSupplier =
      appClient.module.get<GithubAccessTokenSupplier>(
        'GithubAccessTokenSupplier',
      );
  }

  public mockAccessTokenPresent(): string {
    this.spy = jest.spyOn(
      this.githubAccessTokenSupplier,
      'getGithubAccessToken',
    );

    const token = uuid();

    this.spy.mockImplementation(() => Promise.resolve(token));

    return token;
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
