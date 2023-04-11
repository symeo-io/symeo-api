import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';
import VCSAccessTokenStoragePort from 'src/domain/port/out/vcs-access-token.storage.port';
import { v4 as uuid } from 'uuid';

export class FetchVcsAccessTokenMock {
  public spy: SpyInstance | undefined;
  private readonly vcsAccessTokenStorage: VCSAccessTokenStoragePort;

  constructor(appClient: AppClient) {
    this.vcsAccessTokenStorage =
      appClient.module.get<VCSAccessTokenStoragePort>('VCSAccessTokenAdapter');
  }

  public mockAccessTokenPresent(): string {
    this.spy = jest.spyOn(this.vcsAccessTokenStorage, 'getAccessToken');

    const token = uuid();

    this.spy.mockImplementation(() => Promise.resolve(token));

    return token;
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
