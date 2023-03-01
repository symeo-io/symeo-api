import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { ApiKeyTestUtil } from 'tests/utils/entities/api-key.test.util';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

describe('ApiKeyController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let apiKeyTestUtil: ApiKeyTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    apiKeyTestUtil = new ApiKeyTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await apiKeyTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys', () => {
    it('should respond 403 and not create api key for user without permission', async () => {
      // Given
      const currentUserWithoutPermission = new User(
        'github|102222086',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const response = await appClient
        .request(currentUserWithoutPermission)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
        )
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
    });

    it('should respond 201 and create api key', async () => {
      // Given
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const response = await appClient
        .request(currentUserWithPermission)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
        )
        .expect(201);

      expect(response.body.apiKey).toBeDefined();
      expect(response.body.apiKey.environmentId).toEqual(environment.id);
      expect(response.body.apiKey.key).toBeDefined();
      const apiKeyResponse = response.body.apiKey;

      const createdApiKey = await apiKeyTestUtil.repository.findOneBy({
        id: apiKeyResponse.id,
      });

      expect(createdApiKey).toBeDefined();
      expect(createdApiKey?.hiddenKey).toEqual(apiKeyResponse.hiddenKey);
      expect(createdApiKey?.hashedKey).toEqual(
        await ApiKey.hashKey(apiKeyResponse.key),
      );
    });
  });
});
