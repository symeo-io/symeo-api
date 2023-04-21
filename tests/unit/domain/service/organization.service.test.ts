import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { OrganizationService } from 'src/domain/service/organization.service';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import { LicenseStoragePort } from '../../../../src/domain/port/out/license.storage.port';
import { VcsOrganization } from '../../../../src/domain/model/vcs/vcs.organization.model';
import { v4 as uuid } from 'uuid';
import License from '../../../../src/domain/model/license/license.model';
import { PlanEnum } from '../../../../src/domain/model/license/plan.enum';

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
      const mockedLicenseStoragePort: LicenseStoragePort =
        mock<LicenseStoragePort>();
      const licenseStoragePort = instance(mockedLicenseStoragePort);

      const gitlabAdapterPort = instance(mockedGitlabAdapterPort);
      const organizationService: OrganizationService = new OrganizationService(
        githubAdapterPort,
        gitlabAdapterPort,
        licenseStoragePort,
      );

      const vcsOrganizations = [
        new VcsOrganization(
          faker.datatype.number(),
          uuid(),
          faker.name.firstName(),
          faker.internet.url(),
          VCSProvider.GitHub,
        ),
      ];

      const licenses = [
        new License(PlanEnum.FREE, 'fake-key-12345', vcsOrganizations[0].vcsId),
      ];
      const licensesWithHiddenKey = [
        new License(PlanEnum.FREE, '**********2345', vcsOrganizations[0].vcsId),
      ];

      const vcsOrganizationWithHiddenLicenseKey = {
        ...vcsOrganizations[0],
        license: licensesWithHiddenKey[0],
      } as VcsOrganization;

      jest
        .spyOn(githubAdapterPort, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));
      jest
        .spyOn(licenseStoragePort, 'getLicenseForOrganizationIds')
        .mockImplementation(() => Promise.resolve(licenses));

      // When
      const organizations = await organizationService.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([vcsOrganizationWithHiddenLicenseKey]);
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
      const mockedLicenseStoragePort: LicenseStoragePort =
        mock<LicenseStoragePort>();
      const licenseStoragePort = instance(mockedLicenseStoragePort);
      const organizationService: OrganizationService = new OrganizationService(
        githubAdapterPort,
        gitlabAdapterPort,
        licenseStoragePort,
      );

      const vcsOrganizations = [
        new VcsOrganization(
          faker.datatype.number(),
          uuid(),
          faker.name.firstName(),
          faker.internet.url(),
          VCSProvider.GitHub,
        ),
      ];

      const licenses = [
        new License(PlanEnum.FREE, 'fake-key-12345', vcsOrganizations[0].vcsId),
      ];

      const licensesWithHiddenKey = [
        new License(PlanEnum.FREE, '**********2345', vcsOrganizations[0].vcsId),
      ];

      const vcsOrganizationWithHiddenLicenseKey = {
        ...vcsOrganizations[0],
        license: licensesWithHiddenKey[0],
      } as VcsOrganization;

      jest
        .spyOn(gitlabAdapterPort, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));
      jest
        .spyOn(licenseStoragePort, 'getLicenseForOrganizationIds')
        .mockImplementation(() => Promise.resolve(licenses));

      // When
      const organizations = await organizationService.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([vcsOrganizationWithHiddenLicenseKey]);
    });
  });
});
