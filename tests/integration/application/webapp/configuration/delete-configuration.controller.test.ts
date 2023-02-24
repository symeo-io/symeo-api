import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let configurationTestUtil: ConfigurationTestUtil;

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
    configurationTestUtil = new ConfigurationTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
  });

  describe('(DELETE) /configurations/github/:repositoryVcsId/:configurationId', () => {
    it('should respond 404 with unknown configuration id', async () => {
      // Given
      const configurationId = uuid();
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();

      const response = await appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repository.id}/${configurationId}`,
        )
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    });

    it('should respond 404 with unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      fetchVcsRepositoryMock.mockRepositoryMissing();

      const configuration = await configurationTestUtil.createConfiguration(
        repositoryVcsId,
      );

      const response = await appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}`,
        )
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    });

    it('should respond 200 with known repository and id', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      await appClient
        .request(currentUser)
        .delete(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}`,
        )
        .expect(200);

      const deletedConfiguration: ConfigurationEntity | null =
        await configurationTestUtil.repository.findOneBy({
          id: configuration.id,
        });

      expect(deletedConfiguration).toBeNull();
    });
  });
});
