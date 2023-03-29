import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryFilesMock } from 'tests/utils/mocks/fetch-vcs-repository-files.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import * as fs from 'fs';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryFilesMock: FetchVcsRepositoryFilesMock;
  let fetchVcsFileMock: FetchVcsFileMock;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryFilesMock = new FetchVcsRepositoryFilesMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /repository/:repositoryVcsId/env-files/:branch', () => {
    describe('For Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 with github branches', async () => {
        // Given
        const mockRepositoryVcsId = faker.datatype.number();
        const mockBranch = faker.lorem.slug();
        fetchVcsRepositoryFilesMock.mockGithubRepositoriesFilesPresent(
          mockRepositoryVcsId,
          mockBranch,
        );
        const envContent = fs
          .readFileSync('./tests/utils/stubs/repository/.env')
          .toString();
        fetchVcsFileMock.mockGithubFilePresent(
          mockRepositoryVcsId,
          '.env',
          envContent,
        );
        const envTestContent = fs
          .readFileSync('./tests/utils/stubs/repository/.env.test')
          .toString();
        fetchVcsFileMock.mockGithubFilePresent(
          mockRepositoryVcsId,
          '.env.test',
          envTestContent,
        );

        return appClient
          .request(currentUser)
          .get(
            `/api/v1/repositories/${mockRepositoryVcsId}/env-files/${mockBranch}`,
          )
          .expect(200)
          .expect({
            files: [
              {
                path: '.env',
                content: envContent,
                contract:
                  'port:\n' +
                  '  type: integer\n' +
                  'database:\n' +
                  '  name:\n' +
                  '    type: string\n' +
                  '  url:\n' +
                  '    type: string\n' +
                  '  port:\n' +
                  '    type: integer\n' +
                  '  user:\n' +
                  '    type: string\n' +
                  '  password:\n' +
                  '    type: string\n' +
                  '    secret: true\n',
              },
              {
                path: '.env.test',
                content: envTestContent,
                contract:
                  'port:\n  type: integer\ndatabaseName:\n  type: string\n',
              },
            ],
          });
      });
    });

    describe('For Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 with gitlab branches', async () => {
        // Given
        const mockRepositoryVcsId = faker.datatype.number();
        const mockBranch = faker.lorem.slug();
        fetchVcsRepositoryFilesMock.mockGitlabRepositoriesFilesPresent(
          mockRepositoryVcsId,
          mockBranch,
        );
        const envContent = fs
          .readFileSync('./tests/utils/stubs/repository/.env')
          .toString();
        fetchVcsFileMock.mockGitlabFilePresent(
          mockRepositoryVcsId,
          'bbf3674d00b0b5c77747641a486969b289146be9',
          envContent,
        );
        const envTestContent = fs
          .readFileSync('./tests/utils/stubs/repository/.env.test')
          .toString();
        fetchVcsFileMock.mockGitlabFilePresent(
          mockRepositoryVcsId,
          'dc53f4b07fce916396694828c4c4948d8091119c',
          envTestContent,
        );

        return appClient
          .request(currentUser)
          .get(
            `/api/v1/repositories/${mockRepositoryVcsId}/env-files/${mockBranch}`,
          )
          .expect(200)
          .expect({
            files: [
              {
                path: '.env',
                content: envContent,
                contract:
                  'port:\n' +
                  '  type: integer\n' +
                  'database:\n' +
                  '  name:\n' +
                  '    type: string\n' +
                  '  url:\n' +
                  '    type: string\n' +
                  '  port:\n' +
                  '    type: integer\n' +
                  '  user:\n' +
                  '    type: string\n' +
                  '  password:\n' +
                  '    type: string\n' +
                  '    secret: true\n',
              },
              {
                path: 'infrastructure/.env.test',
                content: envTestContent,
                contract:
                  'port:\n  type: integer\ndatabaseName:\n  type: string\n',
              },
            ],
          });
      });
    });
  });
});