import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { RepositoryService } from 'src/domain/service/repository.service';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';

describe('RepositoryService', () => {
  describe('getRepositories', () => {
    it('should get repositories for github as vcs provider', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
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
});
