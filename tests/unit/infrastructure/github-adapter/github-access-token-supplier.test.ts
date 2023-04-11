import { mock } from 'ts-mockito';
import { InMemoryVcsAccessTokenCacheAdapter } from '../../../../src/infrastructure/in-memory-cache-adapter/adapter/in-memory-vcs-access-token-cache.adapter';
import { Auth0Client } from '../../../../src/infrastructure/auth0-adapter/auth0.client';
import { GithubAccessTokenSupplier } from '../../../../src/infrastructure/github-adapter/github-access-token-supplier';
import User from '../../../../src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from '../../../../src/domain/model/vcs/vcs-provider.enum';
import VcsAccessToken from '../../../../src/domain/model/vcs/vcs.access-token.model';

describe('GithubAccessTokenSupplier', () => {
  describe('getGithubAccessToken', () => {
    it('should get github access token in cache', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockedInMemoryCacheAdapter = mock(
        InMemoryVcsAccessTokenCacheAdapter,
      );
      const mockedAuth0Client = mock(Auth0Client);
      const githubAccessTokenSupplier: GithubAccessTokenSupplier =
        new GithubAccessTokenSupplier(
          mockedInMemoryCacheAdapter,
          mockedAuth0Client,
        );

      const mockedVcsAccessToken = new VcsAccessToken(
        VCSProvider.GitHub,
        user.id,
        faker.datatype.number(),
        faker.datatype.string(),
        faker.datatype.number(),
        faker.datatype.string(),
      );

      jest
        .spyOn(mockedInMemoryCacheAdapter, 'findByUser')
        .mockImplementation(async () => mockedVcsAccessToken);

      // When
      const githubAccessToken =
        await githubAccessTokenSupplier.getGithubAccessToken(user);

      // Then
      expect(githubAccessToken).toEqual(mockedVcsAccessToken.accessToken);
    });
  });
});
