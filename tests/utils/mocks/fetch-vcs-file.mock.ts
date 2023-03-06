import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';
import axios from 'axios';
import { config } from 'symeo-js/config';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class FetchVcsFileMock {
  public spy: SpyInstance | undefined;

  public mockFilePresent(
    repositoryOwnerName: string,
    repositoryName: string,
    contractFilePath: string,
    content?: string,
  ): void {
    this.spy = jest.spyOn(axios, 'get');
    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/contents/${contractFilePath}`
      ) {
        return Promise.resolve({
          status: 200 as const,
          headers: {},
          url: '',
          data: {
            content: content,
            encoding: 'base64',
          },
        });
      }
    });
  }

  public mockSymeoContractFilePresent(
    repositoryOwnerName: string,
    repositoryName: string,
    contractFilePath: string,
    stubPath: string,
  ) {
    return this.mockFilePresent(
      repositoryOwnerName,
      repositoryName,
      contractFilePath,
      base64encode(fs.readFileSync(stubPath).toString()) as string,
    );
  }

  public mockFileMissing(
    repositoryOwnerName: string,
    repositoryName: string,
    filePath?: string,
  ): void {
    this.spy = jest.spyOn(axios, 'get');
    this.spy.mockImplementationOnce((path) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/contents/${filePath}`
      ) {
        throw { status: 404 };
      }
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
