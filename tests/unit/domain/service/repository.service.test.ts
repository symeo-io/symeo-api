import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { OrganizationService } from 'src/domain/service/organization.service';
import { RepositoryService } from 'src/domain/service/repository.service';

describe('RepositoryService', () => {
  describe('getRepositories', () => {
    it('should get repositories for github as vcs provider', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
      );
      const organizationName: string = faker.name.firstName();
      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const repositoryService: RepositoryService = new RepositoryService(
        githubAdapterPort,
      );
      const spy = jest.spyOn(githubAdapterPort, 'getRepositories');

      // When
      await repositoryService.getRepositories(user, organizationName);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user, organizationName);
    });
  });
});
