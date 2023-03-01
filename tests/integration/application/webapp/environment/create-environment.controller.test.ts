import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';

describe('EnvironmentController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments', () => {
    it('Should return 403 and not create new environment for user without permission', async () => {
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

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      const response = await appClient
        .request(currentUserWithoutPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
    });

    it('Should return 201 and create new environment', async () => {
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

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(201);

      const configurationEntity: ConfigurationEntity | null =
        await configurationTestUtil.repository.findOneBy({
          id: configuration.id,
        });
      expect(configurationEntity).toBeDefined();
      expect(configurationEntity?.environments.length).toEqual(1);
      expect(configurationEntity?.environments[0].name).toEqual(data.name);
    });
  });
});
