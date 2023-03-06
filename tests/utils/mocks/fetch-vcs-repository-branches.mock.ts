import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import * as fs from 'fs';
import axios from 'axios';
import { config } from 'symeo-js/config';

export class FetchVcsRepositoryBranchesMock {
  public spy: SpyInstance | undefined;

  public mockRepositoriesBranchPresent(vcsRepositoryId: number) {
    this.spy = jest.spyOn(axios, 'get');
    const mockGitHubBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/get_branches_for_repository_id_page_1.json',
        )
        .toString(),
    );
    const mockGitHubBranchesResponse1 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGitHubBranchesStub1,
    };
    const mockGitHubBranchesResponse2 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: [],
    };

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repositories/${vcsRepositoryId}/branches`
      ) {
        return Promise.resolve(mockGitHubBranchesResponse1);
      }
    });

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repositories/${vcsRepositoryId}/branches`
      ) {
        return Promise.resolve(mockGitHubBranchesResponse2);
      }
    });

    return mockGitHubBranchesStub1;
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
