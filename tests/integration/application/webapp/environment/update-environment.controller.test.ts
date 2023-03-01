import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

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
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
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

  describe('(PATCH) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId', () => {
    it('Should return 403 and not update environment for user without permission', async () => {
      // When
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

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        color: 'blueGrey',
      };
      const response = await appClient
        .request(currentUserWithoutPermission)
        // When
        .patch(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}`,
        )
        .send(updatedEnvironmentData)
        // Then
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
    });

    it('Should return 200 and update environment for user with permission', async () => {
      // When
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

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        color: 'blueGrey',
      };
      await appClient
        .request(currentUserWithPermission)
        // When
        .patch(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}`,
        )
        .send(updatedEnvironmentData)
        // Then
        .expect(200);
      const configurationEntity: ConfigurationEntity | null =
        await configurationTestUtil.repository.findOneBy({
          id: configuration.id,
        });
      expect(configurationEntity).toBeDefined();
      expect(configurationEntity?.environments[0].id).toEqual(environment.id);
      expect(configurationEntity?.environments[0].name).toEqual(
        updatedEnvironmentData.name,
      );
      expect(configurationEntity?.environments[0].color).toEqual(
        updatedEnvironmentData.color.toString(),
      );
    });
  });
});
