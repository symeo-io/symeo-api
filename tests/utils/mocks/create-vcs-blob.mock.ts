import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class CreateVcsBlobMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMockGithub;
  }

  public mockCreateRepositoryBlob(repositoryVcsId: number) {
    const mockGitHubBlobStub = {
      sha: faker.datatype.uuid(),
      url: faker.internet.url(),
    };

    this.spy
      .onPost(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/blobs`,
      )
      .replyOnce(200, mockGitHubBlobStub);

    return mockGitHubBlobStub;
  }
}
