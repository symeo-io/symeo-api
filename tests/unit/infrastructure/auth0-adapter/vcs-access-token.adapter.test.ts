import { v4 as uuid } from 'uuid';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import { VCSAccessTokenAdapter } from 'src/infrastructure/auth0-adapter/adapter/vcs-access-token.adapter';
import { faker } from '@faker-js/faker';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

describe('VCSAccessTokenAdapter', () => {
  const auth0Client: Auth0Client = new Auth0Client();
  const vcsAccessTokenAdapter: VCSAccessTokenAdapter =
    new VCSAccessTokenAdapter(auth0Client);

  describe('getGitHubAccessToken', () => {
    it('should return github access token', async () => {
      const user = new User(
        uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockGitHubAccessToken = uuid();
      const mockAuth0User = {
        name: faker.name.fullName(),
        id: user.id,
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
        user,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: user.id });
      expect(receivedToken).toEqual(mockGitHubAccessToken);
      spy.mockRestore();
    });

    it('should return undefined when no identities for user', async () => {
      const user = new User(
        uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockAuth0User = {
        name: faker.name.fullName(),
        id: user.id,
      };

      const spy = jest
        .spyOn(auth0Client.client, 'getUser')
        .mockImplementation(() => Promise.resolve(mockAuth0User));

      const receivedToken = await vcsAccessTokenAdapter.getGitHubAccessToken(
        user,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: user.id });
      expect(receivedToken).toEqual(undefined);
      spy.mockRestore();
    });

    it('should return undefined when no github identity', async () => {
      const user = new User(
        uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockAuth0User = {
        name: faker.name.fullName(),
        id: user.id,
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
        user,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: user.id });
      expect(receivedToken).toEqual(undefined);
      spy.mockRestore();
    });

    it('should return github access token from cache', async () => {
      const user = new User(
        uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockGitHubAccessToken = uuid();
      const mockAuth0User = {
        name: faker.name.fullName(),
        id: user.id,
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

      const receivedToken1 = await vcsAccessTokenAdapter.getGitHubAccessToken(
        user,
      );

      const receivedToken2 = await vcsAccessTokenAdapter.getGitHubAccessToken(
        user,
      );

      const receivedToken3 = await vcsAccessTokenAdapter.getGitHubAccessToken(
        user,
      );

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: user.id });
      expect(receivedToken1).toEqual(mockGitHubAccessToken);
      expect(receivedToken2).toEqual(mockGitHubAccessToken);
      expect(receivedToken3).toEqual(mockGitHubAccessToken);
      spy.mockRestore();
    });
  });
});
