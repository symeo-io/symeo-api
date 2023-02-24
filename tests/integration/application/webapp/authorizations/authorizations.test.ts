import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';

type HttpVerb = 'get' | 'post' | 'put' | 'delete' | 'patch';
type Routes = {
  path: string;
  verbs: HttpVerb[];
};

type Route = {
  path: string;
  verb: HttpVerb;
};

describe('Authorizations', () => {
  const routes: Routes[] = [
    {
      path: '/api/v1/configurations/github/:repositoryVcsId',
      verbs: ['post', 'get'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId',
      verbs: ['delete', 'get', 'patch'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/contract',
      verbs: ['get'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments',
      verbs: ['post'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId',
      verbs: ['patch', 'delete'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys',
      verbs: ['get', 'post'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys/:apiKeyId',
      verbs: ['delete'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions',
      verbs: ['get'],
    },
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
      verbs: ['get', 'post'],
    },
  ];

  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

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
    fetchVcsRepositoryMock.restore();
  });

  const routesWithRepository: Route[] = routes
    .filter((route) => route.path.includes(':repositoryVcsId'))
    .flatMap((route) =>
      route.verbs.map((verb) => ({ path: route.path, verb })),
    );

  test.each(routesWithRepository)(
    '$path should respond 404 with unknown repository id',
    async (route) => {
      // Given
      const repositoryVcsId = faker.datatype.number();
      const configurationId = uuid();
      const environmentId = uuid();
      const apiKeyId = uuid();

      const url = route.path
        .replace(':repositoryVcsId', repositoryVcsId.toString())
        .replace(':configurationId', configurationId)
        .replace(':environmentId', environmentId)
        .replace(':apiKeyId', apiKeyId);

      fetchVcsRepositoryMock.mockRepositoryMissing();

      const response = await appClient
        .request(currentUser)
        [route.verb](url)
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    },
  );

  const routesWithConfiguration: Route[] = routes
    .filter((route) => route.path.includes(':configurationId'))
    .flatMap((route) =>
      route.verbs.map((verb) => ({ path: route.path, verb })),
    );

  test.each(routesWithConfiguration)(
    '$path should respond 404 with unknown configuration id',
    async (route) => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();

      const configurationId = uuid();
      const environmentId = uuid();
      const apiKeyId = uuid();

      const url = route.path
        .replace(':repositoryVcsId', repository.id.toString())
        .replace(':configurationId', configurationId)
        .replace(':environmentId', environmentId)
        .replace(':apiKeyId', apiKeyId);

      fetchVcsRepositoryMock.mockRepositoryMissing();

      const response = await appClient
        .request(currentUser)
        [route.verb](url)
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    },
  );

  const routesWithEnvironment: Route[] = routes
    .filter((route) => route.path.includes(':environmentId'))
    .flatMap((route) =>
      route.verbs.map((verb) => ({ path: route.path, verb })),
    );

  test.each(routesWithEnvironment)(
    '$path should respond 404 with unknown environment id',
    async (route) => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );

      const environmentId = uuid();
      const apiKeyId = uuid();

      const url = route.path
        .replace(':repositoryVcsId', repository.id.toString())
        .replace(':configurationId', configuration.id)
        .replace(':environmentId', environmentId)
        .replace(':apiKeyId', apiKeyId);

      fetchVcsRepositoryMock.mockRepositoryMissing();

      const response = await appClient
        .request(currentUser)
        [route.verb](url)
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    },
  );

  const routesWithApiKey: Route[] = routes
    .filter((route) => route.path.includes(':apiKeyId'))
    .flatMap((route) =>
      route.verbs.map((verb) => ({ path: route.path, verb })),
    );

  test.each(routesWithApiKey)(
    '$path should respond 404 with unknown api key id',
    async (route) => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const apiKeyId = uuid();

      const url = route.path
        .replace(':repositoryVcsId', repository.id.toString())
        .replace(':configurationId', configuration.id)
        .replace(':environmentId', environment.id)
        .replace(':apiKeyId', apiKeyId);

      fetchVcsRepositoryMock.mockRepositoryMissing();

      const response = await appClient
        .request(currentUser)
        [route.verb](url)
        // Then
        .expect(404);

      expect(response.body.code).toEqual(SymeoExceptionCode.API_KEY_NOT_FOUND);
    },
  );
});