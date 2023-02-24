import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let mockAccessToken: string;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
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
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsFileMock.restore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/contract', () => {
    it('should respond 404 with unknown configuration id', () => {
      // Given
      const configurationId = uuid();
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.yml',
      );

      appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repository.id}/${configurationId}/contract`,
        )
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown file', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsRepositoryMock.mockRepositoryMissing();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      fetchVcsFileMock.mockFileMissing();

      appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 with known file and id', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.yml',
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract`,
        )
        .expect(200);

      expect(fetchVcsFileMock.spy).toHaveBeenCalled();
      expect(fetchVcsFileMock.spy).toHaveBeenCalledWith({
        owner: configuration.ownerVcsName,
        repo: configuration.repositoryVcsName,
        path: configuration.contractFilePath,
        ref: configuration.branch,
        headers: { Authorization: `token ${mockAccessToken}` },
      });
      expect(response.body.contract).toBeDefined();
      expect(response.body.contract.database).toBeDefined();
      expect(response.body.contract.database.host).toBeDefined();
      expect(response.body.contract.database.host.type).toEqual('string');
      expect(response.body.contract.database.password).toBeDefined();
      expect(response.body.contract.database.password.type).toEqual('string');
      expect(response.body.contract.database.password.secret).toEqual(true);
    });

    it('should respond 200 with known file and id and custom branch', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.yml',
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      const requestedBranch = faker.datatype.string();
      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/contract?branch=${requestedBranch}`,
        )
        .expect(200);

      expect(fetchVcsFileMock.spy).toHaveBeenCalled();
      expect(fetchVcsFileMock.spy).toHaveBeenCalledWith({
        owner: configuration.ownerVcsName,
        repo: configuration.repositoryVcsName,
        path: configuration.contractFilePath,
        ref: requestedBranch,
        headers: { Authorization: `token ${mockAccessToken}` },
      });
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
