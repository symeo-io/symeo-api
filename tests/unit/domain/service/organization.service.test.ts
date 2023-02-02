import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { OrganizationService } from 'src/domain/service/organization.service';

describe('OrganizationService', () => {
  describe('getOrganizations', () => {
    it('should get organizations for github as vcs provider', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
      );
      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const organizationService: OrganizationService = new OrganizationService(
        githubAdapterPort,
      );
      const spy = jest.spyOn(githubAdapterPort, 'getOrganizations');

      // When
      await organizationService.getOrganizations(user);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user);
    });
  });
});
