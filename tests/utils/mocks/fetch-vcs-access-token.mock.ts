import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { v4 as uuid } from 'uuid';

export class FetchVcsAccessTokenMock {
  public spy: SpyInstance | undefined;
  private readonly vcsAccessTokenStorage: VCSAccessTokenStorage;

  constructor(appClient: AppClient) {
    this.vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
  }

  public mockAccessTokenPresent(): string {
    this.spy = jest.spyOn(this.vcsAccessTokenStorage, 'getGitHubAccessToken');

    const token = uuid();

    this.spy.mockImplementation(() => Promise.resolve(token));

    return token;
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
