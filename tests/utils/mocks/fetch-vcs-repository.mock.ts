import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { config } from 'symeo-js/config';

export type MockedRepository = {
  name: string;
  id: number;
  owner: { login: string; id: number; avatar_url: string };
};

export class FetchVcsRepositoryMock {
  public spy: SpyInstance | undefined;

  public mockRepositoryPresent(): MockedRepository {
    this.spy = jest.spyOn(axios, 'get');
    const data = {
      name: faker.lorem.slug(),
      id: faker.datatype.number(),
      owner: {
        login: faker.lorem.slug(),
        id: faker.datatype.number(),
        avatar_url: faker.lorem.slug(),
      },
      permissions: {
        admin: true,
        maintain: true,
        push: true,
        triage: true,
        pull: true,
      },
    };
    const mockGitHubRepositoryResponse = {
      status: 200 as const,
      headers: {},
      url: '',
      data,
    };

    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl + `repositories/${repositoryVcsId}`
      ) {
        Promise.resolve(mockGitHubRepositoryResponse);
      }
    });

    return data;
  }

  public mockRepositoryMissing(): void {
    this.spy = jest.spyOn(this.githubClient, 'request');
    this.spy.mockImplementationOnce(() => {
      throw { status: 404 };
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
