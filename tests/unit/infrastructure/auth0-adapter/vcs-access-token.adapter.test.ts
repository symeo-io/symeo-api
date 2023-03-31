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

  describe('getAccessToken', () => {
    describe('GithubAccessToken', () => {
      it('should return github access token', async () => {
        const user = new User(
          `github|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
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

        const receivedToken = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken).toEqual(mockGitHubAccessToken);
        spy.mockRestore();
      });

      it('should return undefined when no github identity', async () => {
        const user = new User(
          `github|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
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

        const receivedToken = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken).toEqual(undefined);
        spy.mockRestore();
      });

      it('should return github access token from cache', async () => {
        const user = new User(
          `github|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
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

        const receivedToken1 = await vcsAccessTokenAdapter.getAccessToken(user);

        const receivedToken2 = await vcsAccessTokenAdapter.getAccessToken(user);

        const receivedToken3 = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken1).toEqual(mockGitHubAccessToken);
        expect(receivedToken2).toEqual(mockGitHubAccessToken);
        expect(receivedToken3).toEqual(mockGitHubAccessToken);
        spy.mockRestore();
      });
    });

    describe('GitlabAccessToken', () => {
      it('should return gitlab access token', async () => {
        const user = new User(
          `oauth2|gitlab|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
          VCSProvider.Gitlab,
          faker.datatype.number(),
        );

        const mockGitlabAccessToken = uuid();
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
              access_token: mockGitlabAccessToken,
              provider: 'gitlab',
              user_id: 22441392,
              connection: 'gitlab',
              isSocial: true,
            },
          ],
        };

        const spy = jest
          .spyOn(auth0Client.client, 'getUser')
          .mockImplementation(() => Promise.resolve(mockAuth0User));

        const receivedToken = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken).toEqual(mockGitlabAccessToken);
        spy.mockRestore();
      });

      it('should return undefined when no gitlab identity', async () => {
        const user = new User(
          `oauth2|gitlab|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
          VCSProvider.Gitlab,
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

        const receivedToken = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken).toEqual(undefined);
        spy.mockRestore();
      });

      it('should return gitlab access token from cache', async () => {
        const user = new User(
          `oauth2|gitlab|${faker.datatype.number()}`,
          faker.internet.email(),
          faker.internet.userName(),
          VCSProvider.Gitlab,
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
              provider: 'gitlab',
              user_id: 22441392,
              connection: 'gitlab',
              isSocial: true,
            },
          ],
        };

        const spy = jest
          .spyOn(auth0Client.client, 'getUser')
          .mockImplementation(() => Promise.resolve(mockAuth0User));

        const receivedToken1 = await vcsAccessTokenAdapter.getAccessToken(user);

        const receivedToken2 = await vcsAccessTokenAdapter.getAccessToken(user);

        const receivedToken3 = await vcsAccessTokenAdapter.getAccessToken(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({ id: user.id });
        expect(receivedToken1).toEqual(mockGitHubAccessToken);
        expect(receivedToken2).toEqual(mockGitHubAccessToken);
        expect(receivedToken3).toEqual(mockGitHubAccessToken);
        spy.mockRestore();
      });
    });

    it('should return undefined when no identities for user', async () => {
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
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

      const receivedToken = await vcsAccessTokenAdapter.getAccessToken(user);

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: user.id });
      expect(receivedToken).toEqual(undefined);
      spy.mockRestore();
    });
  });
});
