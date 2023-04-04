import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { config } from '@symeo-sdk';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;

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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(GET) /configurations/:repositoryVcsId/:configurationId/contract', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 404 with unknown file', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );

        fetchVcsFileMock.mockGithubFileMissing(repository.id);

        appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract`,
          )
          // Then
          .expect(404);
      });

      it('should respond 200 and return contract', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGithub(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.yml',
        );
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract`,
          )
          .expect(200);

        const githubRequest = fetchVcsFileMock.githubClientSpy.history.get.find(
          (getRequest) =>
            getRequest.url ===
            config.vcsProvider.github.apiUrl +
              `repositories/${repository.id}/contents/${configuration.contractFilePath}`,
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
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGithub(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.yml',
        );
        const requestedBranch = faker.lorem.slug();
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract?branch=${requestedBranch}`,
          )
          .expect(200);

        const githubRequest = fetchVcsFileMock.githubClientSpy.history.get.find(
          (getRequest) =>
            getRequest.url ===
            config.vcsProvider.github.apiUrl +
              `repositories/${repository.id}/contents/${configuration.contractFilePath}`,
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

    describe('With Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 404 with unknown file', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );

        fetchVcsFileMock.mockGitlabFileMissing(repository.id);

        appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract`,
          )
          // Then
          .expect(404);
      });

      it('should respond 200 and return contract', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGitlab(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.yml',
        );
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract`,
          )
          .expect(200);

        const gitlabRequest = fetchVcsFileMock.gitlabClientSpy.history.get.find(
          (getRequest) =>
            getRequest.url ===
            config.vcsProvider.gitlab.apiUrl +
              `projects/${repository.id}/repository/files/${configuration.contractFilePath}`,
        );
        expect(gitlabRequest).toBeDefined();
        expect(gitlabRequest?.params.ref).toEqual(configuration.branch);
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
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        fetchVcsFileMock.mockSymeoContractFilePresentOnGitlab(
          configuration.repositoryVcsId,
          configuration.contractFilePath,
          './tests/utils/stubs/configuration/symeo.config.yml',
        );
        const requestedBranch = faker.lorem.slug();
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repository.id}/${configuration.id}/contract?branch=${requestedBranch}`,
          )
          .expect(200);

        const githubRequest = fetchVcsFileMock.gitlabClientSpy.history.get.find(
          (getRequest) =>
            getRequest.url ===
            config.vcsProvider.gitlab.apiUrl +
              `projects/${repository.id}/repository/files/${configuration.contractFilePath}`,
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
});
