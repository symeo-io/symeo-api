import { InMemoryVcsAccessTokenCacheAdapter } from '../../../../src/infrastructure/in-memory-cache-adapter/adapter/in-memory-vcs-access-token-cache.adapter';
import VcsAccessToken from '../../../../src/domain/model/vcs/vcs.access-token.model';
import User from '../../../../src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from '../../../../src/domain/model/vcs/vcs-provider.enum';

describe('InMemoryVcsAccessTokenCacheAdapter', () => {
  describe('findByUser', () => {
    it('should not find vcs access token in cache', async () => {
      // Given
      const inMemoryVcsAccessTokenCacheAdapter =
        new InMemoryVcsAccessTokenCacheAdapter();

      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      // When
      const vcsAccessToken =
        await inMemoryVcsAccessTokenCacheAdapter.findByUser(user);

      // Then
      expect(vcsAccessToken).toEqual(undefined);
    });

    it('should find vcs access token in cache', async () => {
      // Given
      const inMemoryVcsAccessTokenCacheAdapter =
        new InMemoryVcsAccessTokenCacheAdapter();

      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const fakeVcsAccessToken = new VcsAccessToken(
        VCSProvider.GitHub,
        user.id,
        faker.datatype.number(),
        faker.datatype.string(),
        faker.datatype.number(),
        faker.datatype.string(),
      );

      inMemoryVcsAccessTokenCacheAdapter.cache[user.id] = {
        [user.accessTokenExpiration]: fakeVcsAccessToken,
      };

      // When
      const vcsAccessToken =
        await inMemoryVcsAccessTokenCacheAdapter.findByUser(user);

      // Then
      expect(vcsAccessToken).toEqual(fakeVcsAccessToken);
    });
  });

  describe('save', () => {
    it('should save vcs access token in cache', async () => {
      // Given
      const inMemoryVcsAccessTokenCacheAdapter =
        new InMemoryVcsAccessTokenCacheAdapter();

      const jwtExpirationDate = faker.datatype.number();

      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        jwtExpirationDate,
      );

      const fakeVcsAccessToken = new VcsAccessToken(
        VCSProvider.GitHub,
        user.id,
        jwtExpirationDate,
        faker.datatype.string(),
        faker.datatype.number(),
        faker.datatype.string(),
      );

      // When
      await inMemoryVcsAccessTokenCacheAdapter.save(fakeVcsAccessToken);

      // Then
      expect(inMemoryVcsAccessTokenCacheAdapter.cache).toBeDefined();
      expect(inMemoryVcsAccessTokenCacheAdapter.cache[user.id]).toBeDefined();
      expect(
        inMemoryVcsAccessTokenCacheAdapter.cache[user.id][
          user.accessTokenExpiration
        ],
      ).toEqual(fakeVcsAccessToken);
    });
  });
});
