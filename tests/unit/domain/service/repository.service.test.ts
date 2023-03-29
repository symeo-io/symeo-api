import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { RepositoryService } from 'src/domain/service/repository.service';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

describe('RepositoryService', () => {
  describe('getRepositories', () => {
    it('should get repositories for github as vcs provider', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockedConfigurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const configurationStoragePort = instance(mockedConfigurationStoragePort);

      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const mockedGitlabAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const gitlabAdapterPort = instance(mockedGitlabAdapterPort);
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
        gitlabAdapterPort,
        configurationStoragePort,
      );
      const spy = jest
        .spyOn(githubAdapterPort, 'getRepositories')
        .mockImplementation(() => Promise.resolve([]));

      // When
      await repositoryService.getRepositories(user);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user);
    });

    it('should get repositories for gitlab as vcs provider', async () => {
      // Given
      const user = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );

      const mockedConfigurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const configurationStoragePort = instance(mockedConfigurationStoragePort);

      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const mockedGitlabAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const gitlabAdapterPort = instance(mockedGitlabAdapterPort);
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
        gitlabAdapterPort,
        configurationStoragePort,
      );
      const spy = jest
        .spyOn(gitlabAdapterPort, 'getRepositories')
        .mockImplementation(() => Promise.resolve([]));

      // When
      await repositoryService.getRepositories(user);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user);
    });
  });

  describe('getRepositoryById', () => {
    it('should get a repository given a vcsId for github as vcsProvider', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repositoryVcsId: number = Number.parseInt(faker.random.numeric(2));
      const githubAdapterPort: GithubAdapterPort = mock<GithubAdapterPort>();
      const gitlabAdapterPort: GitlabAdapterPort = mock<GitlabAdapterPort>();
      const configurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
        gitlabAdapterPort,
        configurationStoragePort,
      );
      const expectedVcsRepository = new VcsRepository(
        1,
        faker.name.firstName(),
        {
          name: faker.name.lastName(),
          id: 2,
          avatarUrl: faker.internet.url(),
        },
        new Date(),
        VCSProvider.GitHub,
        faker.internet.url(),
        true,
        faker.lorem.slug(),
      );

      // When
      const getRepositoryByIdMock = jest
        .spyOn(githubAdapterPort, 'getRepositoryById')
        .mockImplementation(() => Promise.resolve(expectedVcsRepository));
      const vcsRepositoryById = await repositoryService.getRepositoryById(
        user,
        repositoryVcsId,
      );

      // Then
      expect(getRepositoryByIdMock).toBeCalledTimes(1);
      expect(getRepositoryByIdMock).toBeCalledWith(user, repositoryVcsId);
      expect(vcsRepositoryById).toEqual(expectedVcsRepository);
    });

    it('should get a repository given a vcsId for gitlab as vcsProvider', async () => {
      // Given
      const user = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      const repositoryVcsId: number = Number.parseInt(faker.random.numeric(2));
      const githubAdapterPort: GithubAdapterPort = mock<GithubAdapterPort>();
      const gitlabAdapterPort: GitlabAdapterPort = mock<GitlabAdapterPort>();
      const configurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
        gitlabAdapterPort,
        configurationStoragePort,
      );
      const expectedVcsRepository = new VcsRepository(
        1,
        faker.name.firstName(),
        {
          name: faker.name.lastName(),
          id: 2,
          avatarUrl: faker.internet.url(),
        },
        new Date(),
        VCSProvider.Gitlab,
        faker.internet.url(),
        true,
        faker.lorem.slug(),
      );

      // When
      const getRepositoryByIdMock = jest
        .spyOn(gitlabAdapterPort, 'getRepositoryById')
        .mockImplementation(() => Promise.resolve(expectedVcsRepository));
      const vcsRepositoryById = await repositoryService.getRepositoryById(
        user,
        repositoryVcsId,
      );

      // Then
      expect(getRepositoryByIdMock).toBeCalledTimes(1);
      expect(getRepositoryByIdMock).toBeCalledWith(user, repositoryVcsId);
      expect(vcsRepositoryById).toEqual(expectedVcsRepository);
    });
  });
});
