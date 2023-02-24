import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';

export class CheckVcsFileExistsMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockFilePresent(): void {
    this.spy = jest.spyOn(this.githubClient.repos, 'getContent');
    this.spy.mockImplementation(() =>
      Promise.resolve({ status: 200 as const }),
    );
  }

  public mockFileMissing(): void {
    this.spy = jest.spyOn(this.githubClient.repos, 'getContent');
    this.spy.mockImplementationOnce(() => {
      throw { status: 404 };
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
