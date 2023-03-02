import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export type MockedRepository = {
  name: string;
  id: number;
  owner: { login: string; id: number; avatar_url: string };
};

export class FetchVcsRepositoryMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockRepositoryPresent(): MockedRepository {
    this.spy = jest.spyOn(this.githubClient, 'request');
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

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGitHubRepositoryResponse),
    );

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
