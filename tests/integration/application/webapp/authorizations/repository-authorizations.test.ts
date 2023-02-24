import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

type HttpVerb = 'get' | 'post' | 'put' | 'delete' | 'patch';
type Route = {
  path: string;
  verb: HttpVerb;
};

describe('Authorizations', () => {
  const routes: Route[] = [
    {
      path: '/api/v1/configurations/github/:repositoryVcsId/:configurationId',
      verb: 'get',
    },
  ];

  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;

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
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
  });

  test.each(routes)(
    '$path should respond 404 with unknown repository id',
    async (route) => {
      // Given
      const repositoryVcsId = faker.datatype.number();
      const configurationId = faker.datatype.string();
      const environmentId = faker.datatype.string();
      const apiKeyId = faker.datatype.string();

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
});
