import { v4 as uuid } from 'uuid';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import { VCSAccessTokenAdapter } from 'src/infrastructure/auth0-adapter/adapter/vcs-access-token.adapter';
import { faker } from '@faker-js/faker';

describe('VCSAccessTokenAdapter', () => {
  const auth0Client: Auth0Client = new Auth0Client();
  const vcsAccessTokenAdapter: VCSAccessTokenAdapter =
    new VCSAccessTokenAdapter(auth0Client);

  describe('getGitHubAccessToken', () => {
    it('should return github access token', async () => {
      const userId = uuid();
      const mockGitHubAccessToken = uuid();
      const mockAuth0User = {
        name: faker.name.fullName(),
        id: userId,
        identities: [
          {
            provider: 'google',
            user_id: 22441392,
            connection: 'google',
            isSocial: true,
          },
          {
            access_token: mockGitHubAccessToken,
            provider: 'github',
            user_id: 22441392,
            connection: 'github',
            isSocial: true,
          },
        ],
      };

      const spy = jest
        .spyOn(auth0Client.client, 'getUser')
        .mockImplementation(() => Promise.resolve(mockAuth0User));

      const receivedToken = await vcsAccessTokenAdapter.getGitHubAccessToken(
        userId,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: userId });
      expect(receivedToken).toEqual(mockGitHubAccessToken);
      spy.mockClear();
    });

    it('should return undefined when no identities for user', async () => {
      const userId = uuid();
      const mockAuth0User = {
        name: faker.name.fullName(),
        id: userId,
      };

      const spy = jest
        .spyOn(auth0Client.client, 'getUser')
        .mockImplementation(() => Promise.resolve(mockAuth0User));

      const receivedToken = await vcsAccessTokenAdapter.getGitHubAccessToken(
        userId,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: userId });
      expect(receivedToken).toEqual(undefined);
      spy.mockClear();
    });

    it('should return undefined when no github identity', async () => {
      const userId = uuid();
      const mockAuth0User = {
        name: faker.name.fullName(),
        id: userId,
        identities: [
          {
            access_token: uuid(),
            provider: 'google',
            user_id: 22441392,
            connection: 'google',
            isSocial: true,
          },
        ],
      };

      const spy = jest
        .spyOn(auth0Client.client, 'getUser')
        .mockImplementation(() => Promise.resolve(mockAuth0User));

      const receivedToken = await vcsAccessTokenAdapter.getGitHubAccessToken(
        userId,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: userId });
      expect(receivedToken).toEqual(undefined);
      spy.mockClear();
    });
  });
});
