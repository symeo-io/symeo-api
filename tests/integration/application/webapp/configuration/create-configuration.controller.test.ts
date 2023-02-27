import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsFileMock.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId', () => {
    it('should respond 404 and not create configuration for non existing config file', async () => {
      // Given
      const currentUser = new User(
        uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockFileMissing();

      await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/${repository.id}`)
        .send({
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        })
        // Then
        .expect(404);
    });

    it('should respond 403 and not create configuration for non admin user', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockFileMissing();

      const currentUser = new User(
        'github|102222086',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/${repository.id}`)
        .send({
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        })
        // Then
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
    });

    it('should respond 200 and create new configuration', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      fetchVcsFileMock.mockFilePresent();

      const currentUser = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const sendData = {
        name: faker.name.jobTitle(),
        branch: 'staging',
        contractFilePath: './symeo.config.yml',
      };

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/${repository.id}`)
        .send(sendData)
        // Then
        .expect(201);

      expect(response.body.configuration.id).toBeDefined();
      const configuration: ConfigurationEntity | null =
        await configurationTestUtil.repository.findOneBy({
          id: response.body.configuration.id,
        });

      expect(configuration).toBeDefined();
      expect(configuration?.name).toEqual(sendData.name);
      expect(configuration?.repositoryVcsId).toEqual(repository.id);
      expect(configuration?.repositoryVcsName).toEqual(repository.name);
      expect(configuration?.ownerVcsId).toEqual(repository.owner.id);
      expect(configuration?.ownerVcsName).toEqual(repository.owner.login);
      expect(configuration?.vcsType).toEqual(VCSProvider.GitHub);
      expect(configuration?.contractFilePath).toEqual(
        sendData.contractFilePath,
      );
      expect(configuration?.branch).toEqual(sendData.branch);
      expect(configuration?.environments).toBeDefined();
      expect(configuration?.environments.length).toEqual(2);
    });
  });
});
