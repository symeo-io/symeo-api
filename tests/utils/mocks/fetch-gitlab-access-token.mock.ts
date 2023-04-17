import SpyInstance = jest.SpyInstance;
import { AppClient } from '../app.client';
import { GitlabAccessTokenSupplier } from '../../../src/infrastructure/gitlab-adapter/gitlab-access-token-supplier';
import { v4 as uuid } from 'uuid';

export class FetchGitlabAccessTokenMock {
  public spy: SpyInstance | undefined;
  private readonly gitlabAccessTokenSupplier: GitlabAccessTokenSupplier;

  constructor(appClient: AppClient) {
    this.gitlabAccessTokenSupplier =
      appClient.module.get<GitlabAccessTokenSupplier>(
        'GitlabAccessTokenSupplier',
      );
  }

  public mockAccessTokenPresent(): string {
    this.spy = jest.spyOn(
      this.gitlabAccessTokenSupplier,
      'getGitlabAccessToken',
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
