import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
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
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    fetchSecretMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    describe('With Github as VcsProvider', () => {
      const userVcsId = 102222086;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and return hidden values with selected branch contract equal default branch contract', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${configuration.branch}`,
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

      it('should respond 200 and return hidden values with selected branch contract different from default branch contract', async () => {
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
        fetchVcsFileMock.mockSymeoContractFilePresentOnGithub(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.different.config.secret.yml',
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
            `/api/v1/configurations/${repository.id}/${
              configuration.id
            }/environments/${
              environment.id
            }/values?branch=${faker.name.firstName()}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: '*********',
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

      it('should respond 200 and return hidden values with specific versionId with selected branch contract equal default branch contract', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${configuration.branch}&versionId=${versionId}`,
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
      const userVcsId = 12917479;
      const currentUser = new User(
        `gitlab|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 and return hidden values with selected branch contract equal default branch contract', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${configuration.branch}`,
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

      it('should respond 200 and return hidden values with selected branch contract different from default branch contract', async () => {
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
        fetchVcsFileMock.mockSymeoContractFilePresentOnGitlab(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.different.config.secret.yml',
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
            `/api/v1/configurations/${repository.id}/${
              configuration.id
            }/environments/${
              environment.id
            }/values?branch=${faker.name.firstName()}`,
          )
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
          aws: {
            region: '*********',
            user: '*********',
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

      it('should respond 200 and return hidden values with specific versionId with selected branch contract equal default branch contract', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${configuration.branch}&versionId=${versionId}`,
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
