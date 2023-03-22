import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsFileMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockFilePresent(
    repositoryOwnerName: string,
    repositoryName: string,
    contractFilePath: string,
    content?: string,
  ): void {
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/contents/${contractFilePath}`,
      )
      .reply(200, {
        content: content,
        encoding: 'base64',
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
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/contents/${filePath}`,
      )
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }
}
