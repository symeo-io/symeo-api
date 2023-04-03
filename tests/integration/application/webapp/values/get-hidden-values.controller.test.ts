import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
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
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchSecretMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    describe('With Github as VcsProvider', () => {
      const requestedBranch = 'staging';
      const userVcsId = 102222086;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and return hidden values', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGithub(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.secret.yml',
        );

        const configurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        };

        fetchSecretMock.mockSecretPresent(configurationValues);

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });

      it('should respond 200 and return hidden values with specific versionId', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGithub(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.secret.yml',
        );

        const configurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        };

        fetchSecretMock.mockSecretPresent(configurationValues);

        const versionId = faker.datatype.uuid();

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}&versionId=${versionId}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: versionId,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });
    });

    describe('With Gitlab as VcsProvider', () => {
      const requestedBranch = 'staging';
      const userVcsId = 12917479;
      const currentUser = new User(
        `gitlab|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 and return hidden values', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGitlab(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.secret.yml',
        );

        const configurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        };

        fetchSecretMock.mockSecretPresent(configurationValues);

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });

      it('should respond 200 and return hidden values with specific versionId', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGitlab(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.secret.yml',
        );

        const configurationValues: ConfigurationValues = {
          aws: {
            region: 'eu-west-3',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        };

        fetchSecretMock.mockSecretPresent(configurationValues);

        const versionId = faker.datatype.uuid();

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}&versionId=${versionId}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: versionId,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: 'fake-host',
              port: 9999,
              password: '********',
              type: 'postgres',
            },
          },
        });
      });
    });
  });
});
