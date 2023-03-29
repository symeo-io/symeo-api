import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;

  const currentUser = new User(
    `github|${faker.datatype.number()}`,
    faker.internet.email(),
    faker.internet.userName(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(GET) /github/validate', () => {
    it('should respond false for unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      fetchVcsRepositoryMock.mockRepositoryMissing(repositoryVcsId);

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/validate`)
        .send({
          repositoryVcsId,
          contractFilePath: 'symeo.config.yml',
          branch: 'staging',
        })
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(false);
    });

    it('should respond false for non existing file', async () => {
      // Given
      const repositoryVcsId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(repositoryVcsId);
      const dataToSend = {
        repositoryVcsId: repository.id,
        contractFilePath: faker.lorem.slug(),
        branch: faker.lorem.slug(),
      };
      fetchVcsFileMock.mockFileMissing(
        repository.id,
        dataToSend.contractFilePath,
      );

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/validate`)
        .send(dataToSend)
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(false);
    });

    it('should respond true for existing file', async () => {
      // Given
      const repositoryVcsId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(repositoryVcsId);
      const dataToSend = {
        repositoryVcsId: repository.id,
        contractFilePath: 'symeo.config.yml',
        branch: 'staging',
      };
      fetchVcsFileMock.mockGithubFilePresent(
        repository.id,
        dataToSend.contractFilePath,
      );

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/validate`)
        .send(dataToSend)
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(true);
    });
  });
});
