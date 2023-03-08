import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { anyString } from 'ts-mockito';
import { config } from 'symeo-js';
import { AxiosRequestConfig } from 'axios';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let mockAccessToken: string;

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
    configurationTestUtil = new ConfigurationTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    mockAccessToken = fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/contract', () => {
    it('should respond 404 with unknown file', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      fetchVcsFileMock.mockFileMissing(repository.owner.login, repository.name);

      appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 and return contract', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.ownerVcsName,
        configuration.repositoryVcsName,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.yml',
      );
      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract`,
        )
        .expect(200);

      const githubRequest = fetchVcsFileMock.spy.history.get.find(
        (getRequest) =>
          getRequest.url ===
          config.vcsProvider.github.apiUrl +
            `repos/${configuration.ownerVcsName}/${configuration.repositoryVcsName}/contents/${configuration.contractFilePath}`,
      );
      expect(githubRequest).toBeDefined();
      expect(githubRequest?.params.ref).toEqual(configuration.branch);
      expect(response.body.contract).toBeDefined();
      expect(response.body.contract.database).toBeDefined();
      expect(response.body.contract.database.host).toBeDefined();
      expect(response.body.contract.database.host.type).toEqual('string');
      expect(response.body.contract.database.password).toBeDefined();
      expect(response.body.contract.database.password.type).toEqual('string');
      expect(response.body.contract.database.password.secret).toEqual(true);
    });

    it('should respond 200 and return contract for custom branch', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.ownerVcsName,
        configuration.repositoryVcsName,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.yml',
      );
      const requestedBranch = faker.lorem.slug();
      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract?branch=${requestedBranch}`,
        )
        .expect(200);

      const githubRequest = fetchVcsFileMock.spy.history.get.find(
        (getRequest) =>
          getRequest.url ===
          config.vcsProvider.github.apiUrl +
            `repos/${configuration.ownerVcsName}/${configuration.repositoryVcsName}/contents/${configuration.contractFilePath}`,
      );
      expect(githubRequest).toBeDefined();
      expect(githubRequest?.params.ref).toEqual(requestedBranch);
      expect(response.body.contract).toBeDefined();
      expect(response.body.contract.database).toBeDefined();
      expect(response.body.contract.database.host).toBeDefined();
      expect(response.body.contract.database.host.type).toEqual('string');
      expect(response.body.contract.database.password).toBeDefined();
      expect(response.body.contract.database.password.type).toEqual('string');
      expect(response.body.contract.database.password.secret).toEqual(true);
    });
  });
});
