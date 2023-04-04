import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class UpdateVcsRepositoryRefMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMockGithub;
  }

  public mockUpdateRef(repositoryVcsId: number, branch: string) {
    this.spy
      .onPost(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/refs/heads/${branch}`,
      )
      .replyOnce(200);
  }
}
