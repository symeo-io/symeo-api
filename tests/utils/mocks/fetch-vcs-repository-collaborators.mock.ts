import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import * as fs from 'fs';
import axios from 'axios';
import { config } from 'symeo-js/config';

export class FetchVcsRepositoryCollaboratorsMock {
  public spy: SpyInstance | undefined;

  public mockCollaboratorsPresent(
    repositoryOwnerName: string,
    repositoryName: string,
  ): void {
    this.spy = jest.spyOn(axios, 'get');

    const mockGithubListCollaboratorsStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_1.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub2 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_2.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub3 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_3.json',
        )
        .toString(),
    );

    const mockGithubListCollaboratorsResponse1 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub1,
    };

    const mockGithubListCollaboratorsResponse2 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub2,
    };

    const mockGithubListCollaboratorsResponse3 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub3,
    };

    const mockGithubListCollaboratorsResponse4 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: [],
    };

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`
      ) {
        return Promise.resolve(mockGithubListCollaboratorsResponse1);
      }
    });

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`
      ) {
        return Promise.resolve(mockGithubListCollaboratorsResponse2);
      }
    });

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`
      ) {
        return Promise.resolve(mockGithubListCollaboratorsResponse3);
      }
    });

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`
      ) {
        return Promise.resolve(mockGithubListCollaboratorsResponse4);
      }
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
