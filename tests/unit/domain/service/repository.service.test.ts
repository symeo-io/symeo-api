import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { RepositoryService } from 'src/domain/service/repository.service';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsRepository } from '../../../../src/domain/model/vcs.repository.model';

describe('RepositoryService', () => {
  describe('getRepositories', () => {
    it('should get repositories for github as vcs provider', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      const mockedConfigurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const configurationStoragePort = instance(mockedConfigurationStoragePort);

      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);

      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
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
  });

  describe('getRepositoryById', () => {
    it('should get a repository given a vcsId', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repositoryVcsId: number = Number.parseInt(faker.random.numeric(2));
      const githubAdapterPort: GithubAdapterPort = mock<GithubAdapterPort>();
      const configurationStoragePort: ConfigurationStoragePort =
        mock<ConfigurationStoragePort>();
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
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
  });
});
