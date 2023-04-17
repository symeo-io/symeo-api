import { mock } from 'ts-mockito';
import User from '../../../../src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from '../../../../src/domain/model/vcs/vcs-provider.enum';
import VcsAccessToken from '../../../../src/domain/model/vcs/vcs.access-token.model';
import { AuthenticationProviderPort } from '../../../../src/domain/port/out/authentication-provider.port';
import {
  GitlabAccessTokenHttpClient,
  NewGitlabAccessTokens,
} from '../../../../src/infrastructure/gitlab-adapter/gitlab-access-token.http.client';
import { GitlabAccessTokenSupplier } from '../../../../src/infrastructure/gitlab-adapter/gitlab-access-token-supplier';
import VCSAccessTokenStoragePort from '../../../../src/domain/port/out/vcs-access-token.storage.port';
import { AuthenticationProviderUser } from '../../../../src/domain/model/user/authentication-provider-user.model';
import { GithubAccessTokenSupplier } from '../../../../src/infrastructure/github-adapter/github-access-token-supplier';
import { SymeoException } from '../../../../src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from '../../../../src/domain/exception/symeo.exception.code.enum';

describe('GitlabAccessTokenSupplier', () => {
  describe('getGitlabAccessToken', () => {
    let mockedVcsAccessTokenStoragePort: VCSAccessTokenStoragePort;
    let mockedAuthenticationProvider: AuthenticationProviderPort;
    let mockedGitlabAccessTokenHttpClient: GitlabAccessTokenHttpClient;
    let gitlabAccessTokenSupplier: GitlabAccessTokenSupplier;

    beforeAll(() => {
      mockedVcsAccessTokenStoragePort = mock<VCSAccessTokenStoragePort>();
      mockedAuthenticationProvider = mock<AuthenticationProviderPort>();
      mockedGitlabAccessTokenHttpClient = mock(GitlabAccessTokenHttpClient);
      gitlabAccessTokenSupplier = new GitlabAccessTokenSupplier(
        mockedVcsAccessTokenStoragePort,
        mockedAuthenticationProvider,
        mockedGitlabAccessTokenHttpClient,
      );
    });

    const user = new User(
      `gitlab|${faker.datatype.number()}`,
      faker.internet.email(),
      faker.internet.userName(),
      VCSProvider.Gitlab,
      faker.datatype.number(),
    );

    const maxRetryAmount = 1;

    it('should get gitlab access token (persisted - not expired)', async () => {
      // Given
      const user = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );

      const maxRetryAmount = faker.datatype.number({ min: 3, max: 5 });

      const mockedVcsAccessToken = new VcsAccessToken(
        VCSProvider.Gitlab,
        user.id,
        faker.datatype.number(),
        faker.datatype.string(),
        Math.round(Date.now() / 1000) +
          faker.datatype.number({ min: 100, max: 200 }),
        faker.datatype.string(),
      );

      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementationOnce(() => Promise.resolve(mockedVcsAccessToken));

      // When
      const gitlabAccessToken =
        await gitlabAccessTokenSupplier.getGitlabAccessToken(
          user,
          maxRetryAmount,
        );

      // Then
      expect(gitlabAccessToken).toEqual(mockedVcsAccessToken.accessToken);
    });

    it('should get gitlab access token (persisted - expired)', async () => {
      // Given
      const user = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );

      const maxRetryAmount = faker.datatype.number({ min: 3, max: 5 });

      const mockedVcsAccessTokenStoragePort = mock<VCSAccessTokenStoragePort>();
      const mockedAuthenticationProvider = mock<AuthenticationProviderPort>();
      const mockedGitlabAccessTokenHttpClient = mock(
        GitlabAccessTokenHttpClient,
      );
      const gitlabAccessTokenSupplier: GitlabAccessTokenSupplier =
        new GitlabAccessTokenSupplier(
          mockedVcsAccessTokenStoragePort,
          mockedAuthenticationProvider,
          mockedGitlabAccessTokenHttpClient,
        );

      const mockedVcsAccessToken = new VcsAccessToken(
        VCSProvider.Gitlab,
        user.id,
        faker.datatype.number(),
        faker.datatype.string(),
        Math.round(Date.now() / 1000) -
          faker.datatype.number({ min: 100, max: 200 }),
        faker.datatype.string(),
      );

      const mockedNewGitlabTokens: NewGitlabAccessTokens = {
        access_token: faker.datatype.string(),
        expires_in: faker.datatype.number(),
        refresh_token: faker.datatype.string(),
      };

      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementationOnce(() => Promise.resolve(mockedVcsAccessToken));

      jest
        .spyOn(mockedGitlabAccessTokenHttpClient, 'refreshToken')
        .mockImplementationOnce(() => Promise.resolve(mockedNewGitlabTokens));

      // When
      const gitlabAccessToken =
        await gitlabAccessTokenSupplier.getGitlabAccessToken(
          user,
          maxRetryAmount,
        );

      // Then
      expect(gitlabAccessToken).toEqual(mockedNewGitlabTokens.access_token);
    });

    it('should get gitlab access token (not persisted)', async () => {
      // Given

      const mockedAuthenticationProviderUser = new AuthenticationProviderUser(
        user.id,
        faker.datatype.string(),
        faker.datatype.string(),
        faker.datatype.string(),
      );

      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      jest
        .spyOn(mockedAuthenticationProvider, 'getUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockedAuthenticationProviderUser),
        );
      // When
      const gitlabAccessToken =
        await gitlabAccessTokenSupplier.getGitlabAccessToken(
          user,
          maxRetryAmount,
        );

      // Then
      expect(gitlabAccessToken).toEqual(
        mockedAuthenticationProviderUser.accessToken,
      );
    });

    it('should throw token refresh failure', async () => {
      // When
      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementationOnce(async () => {
          throw new Error();
        });
      jest
        .spyOn(mockedVcsAccessTokenStoragePort, 'findByUser')
        .mockImplementationOnce(async () => {
          throw new Error();
        });

      let exception = null;
      try {
        await gitlabAccessTokenSupplier.getGitlabAccessToken(
          user,
          maxRetryAmount,
        );
      } catch (error) {
        exception = error;
      }

      expect(exception).toEqual(
        new SymeoException(
          `All ${maxRetryAmount} retry attempts exhausted while trying to retrieve gitlab access token for user with userId ${user.id}`,
          SymeoExceptionCode.TOKEN_REFRESH_FAILURE,
        ),
      );

      // Then
    });
  });
});
