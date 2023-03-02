import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import { MockedRepository } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import * as fs from 'fs';

export class FetchVcsRepositoriesMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockRepositoryPresent(): MockedRepository[] {
    this.spy = jest.spyOn(
      this.githubClient.rest.repos,
      'listForAuthenticatedUser',
    );

    const mockGitHubRepositoriesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/get_repositories_for_orga_name_page_1.json',
        )
        .toString(),
    );
    const mockGitHubRepositoriesResponse1 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGitHubRepositoriesStub1,
    };
    const mockGitHubRepositoriesResponse2 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: [],
    };

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGitHubRepositoriesResponse1),
    );

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGitHubRepositoriesResponse2),
    );

    return mockGitHubRepositoriesStub1;
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
