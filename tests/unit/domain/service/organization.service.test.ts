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
import { SymeoException } from '../../../../src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from '../../../../src/domain/exception/symeo.exception.code.enum';

describe('OrganizationService', () => {
  let mockedGithubAdapterPort: GithubAdapterPort;
  let githubAdapterPort: GithubAdapterPort;
  let mockedGitlabAdapterPort: GitlabAdapterPort;
  let gitlabAdapterPort: GitlabAdapterPort;
  let mockedLicenseStoragePort: LicenseStoragePort;
  let licenseStoragePort: LicenseStoragePort;
  let organizationService: OrganizationService;

  beforeEach(() => {
    mockedGithubAdapterPort = mock<GithubAdapterPort>();
    githubAdapterPort = instance(mockedGithubAdapterPort);
    mockedGitlabAdapterPort = mock<GitlabAdapterPort>();
    gitlabAdapterPort = instance(mockedGitlabAdapterPort);
    mockedLicenseStoragePort = mock<LicenseStoragePort>();
    licenseStoragePort = instance(mockedLicenseStoragePort);
    organizationService = new OrganizationService(
      githubAdapterPort,
      gitlabAdapterPort,
      licenseStoragePort,
    );
  });

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
        .spyOn(licenseStoragePort, 'findForOrganizationIds')
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
        .spyOn(licenseStoragePort, 'findForOrganizationIds')
        .mockImplementation(() => Promise.resolve(licenses));

      // When
      const organizations = await organizationService.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([vcsOrganizationWithHiddenLicenseKey]);
    });
  });

  describe('updateLicense', () => {
    it('should not update license and throw license key not found exception', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenseKey = uuid();
      const organizationVcsId = faker.datatype.number();

      const persistedLicense = new License(
        PlanEnum.APP_SUMO,
        licenseKey,
        faker.datatype.number(),
      );

      // When
      jest
        .spyOn(licenseStoragePort, 'findForLicenseKey')
        .mockImplementation(() => Promise.resolve(persistedLicense));

      let exception = null;
      try {
        await organizationService.updateLicense(
          user,
          organizationVcsId,
          licenseKey,
        );
      } catch (error) {
        exception = error;
      }

      // Then
      expect(exception).toEqual(
        new SymeoException(
          'The license key has already been used.',
          SymeoExceptionCode.LICENSE_KEY_ALREADY_USED,
        ),
      );
    });

    it('should not update license and throw license key already used exception', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenseKey = uuid();
      const organizationVcsId = faker.datatype.number();

      // When
      jest
        .spyOn(licenseStoragePort, 'findForLicenseKey')
        .mockImplementation(() => Promise.resolve(undefined));

      let exception = null;
      try {
        await organizationService.updateLicense(
          user,
          organizationVcsId,
          licenseKey,
        );
      } catch (error) {
        exception = error;
      }

      // Then
      expect(exception).toEqual(
        new SymeoException(
          'License key not valid.',
          SymeoExceptionCode.LICENSE_KEY_NOT_FOUND,
        ),
      );
    });

    it('should update license', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenseKey = uuid();
      const organizationVcsId = faker.datatype.number();

      // When
      const persistedLicense = new License(PlanEnum.APP_SUMO, licenseKey);
      jest
        .spyOn(licenseStoragePort, 'findForLicenseKey')
        .mockImplementation(() => Promise.resolve(persistedLicense));
      const updatedLicense = await organizationService.updateLicense(
        user,
        organizationVcsId,
        licenseKey,
      );

      // Then
      expect(updatedLicense).toEqual({
        ...persistedLicense,
        organizationVcsId: organizationVcsId,
      } as License);
    });
  });
});
