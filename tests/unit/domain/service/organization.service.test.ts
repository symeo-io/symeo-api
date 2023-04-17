import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { OrganizationService } from 'src/domain/service/organization.service';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';

describe('OrganizationService', () => {
  describe('getOrganizations', () => {
    it('should get organizations for github as vcs provider', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const mockedGitlabAdapterPort: GitlabAdapterPort =
        mock<GitlabAdapterPort>();
      const gitlabAdapterPort = instance(mockedGitlabAdapterPort);
      const organizationService: OrganizationService = new OrganizationService(
        githubAdapterPort,
        gitlabAdapterPort,
      );
      const spy = jest.spyOn(githubAdapterPort, 'getOrganizations');

      // When
      await organizationService.getOrganizations(user);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user);
    });

    it('should get organizations for gitlab as vcs provider', async () => {
      // Given
      const user = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      const mockedGithubAdapterPort: GithubAdapterPort =
        mock<GithubAdapterPort>();
      const githubAdapterPort = instance(mockedGithubAdapterPort);
      const mockedGitlabAdapterPort: GitlabAdapterPort =
        mock<GitlabAdapterPort>();
      const gitlabAdapterPort = instance(mockedGitlabAdapterPort);
      const organizationService: OrganizationService = new OrganizationService(
        githubAdapterPort,
        gitlabAdapterPort,
      );
      const spy = jest.spyOn(gitlabAdapterPort, 'getOrganizations');

      // When
      await organizationService.getOrganizations(user);

      // Then
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(user);
    });
  });
});
