import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class CreateVcsCommitMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockCreateRepositoryCommit(repositoryVcsId: number) {
    const mockGitHubBlobStub = {
      sha: faker.datatype.uuid(),
      url: faker.internet.url(),
    };

    this.spy
      .onPost(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/commits`,
      )
      .replyOnce(200, mockGitHubBlobStub);

    return mockGitHubBlobStub;
  }
}
