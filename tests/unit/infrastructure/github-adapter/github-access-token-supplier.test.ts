import { mock } from 'ts-mockito';
import { GithubAccessTokenSupplier } from '../../../../src/infrastructure/github-adapter/github-access-token-supplier';
import User from '../../../../src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from '../../../../src/domain/model/vcs/vcs-provider.enum';
import VcsAccessToken from '../../../../src/domain/model/vcs/vcs.access-token.model';
import { AuthenticationProviderPort } from '../../../../src/domain/port/out/authentication-provider.port';
import { AuthenticationProviderUser } from '../../../../src/domain/model/user/authentication-provider-user.model';
import VCSAccessTokenStoragePort from '../../../../src/domain/port/out/vcs-access-token.storage.port';

describe('GithubAccessTokenSupplier', () => {
  describe('getGithubAccessToken', () => {
    let mockedVcsAccessTokenStoragePort: VCSAccessTokenStoragePort;
    let mockedAuthenticationProvider: AuthenticationProviderPort;
    let githubAccessTokenSupplier: GithubAccessTokenSupplier;

    beforeAll(() => {
      mockedVcsAccessTokenStoragePort = mock<VCSAccessTokenStoragePort>();
      mockedAuthenticationProvider = mock<AuthenticationProviderPort>();
      githubAccessTokenSupplier = new GithubAccessTokenSupplier(
        mockedVcsAccessTokenStoragePort,
        mockedAuthenticationProvider,
      );
    });

    const user = new User(
      `github|${faker.datatype.number()}`,
      faker.internet.email(),
      faker.internet.userName(),
      VCSProvider.GitHub,
      faker.datatype.number(),
    );

    it('should get github access token in cache', async () => {
      // Given
      const mockedVcsAccessToken = new VcsAccessToken(
        VCSProvider.GitHub,
        user.id,
        faker.datatype.number(),
        faker.datatype.string(),
        faker.datatype.number(),
        faker.datatype.string(),
      );

      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementation(() => Promise.resolve(mockedVcsAccessToken));

      // When
      const githubAccessToken =
        await githubAccessTokenSupplier.getGithubAccessToken(user);

      // Then
      expect(githubAccessToken).toEqual(mockedVcsAccessToken.accessToken);
    });

    it('should get github access token not in cache', async () => {
      // Given
      const mockedAuthenticationProviderUser = new AuthenticationProviderUser(
        user.id,
        faker.datatype.string(),
        faker.datatype.string(),
      );

      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementation(() => Promise.resolve(undefined));
      jest
        .spyOn(mockedAuthenticationProvider, 'getUser')
        .mockImplementation(() =>
          Promise.resolve(mockedAuthenticationProviderUser),
        );

      // When
      const githubAccessToken =
        await githubAccessTokenSupplier.getGithubAccessToken(user);

      // Then
      expect(githubAccessToken).toEqual(
        mockedAuthenticationProviderUser.accessToken,
      );
    });
  });
});
