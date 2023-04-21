import { instance, mock } from 'ts-mockito';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { OrganizationService } from 'src/domain/service/organization.service';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import { LicenceStoragePort } from '../../../../src/domain/port/out/licence.storage.port';
import { VcsOrganization } from '../../../../src/domain/model/vcs/vcs.organization.model';
import { v4 as uuid } from 'uuid';
import Licence from '../../../../src/domain/model/licence/licence.model';
import { PlanEnum } from '../../../../src/domain/model/licence/plan.enum';
import { SymeoException } from '../../../../src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from '../../../../src/domain/exception/symeo.exception.code.enum';

describe('OrganizationService', () => {
  let mockedGithubAdapterPort: GithubAdapterPort;
  let githubAdapterPort: GithubAdapterPort;
  let mockedGitlabAdapterPort: GitlabAdapterPort;
  let gitlabAdapterPort: GitlabAdapterPort;
  let mockedLicenceStoragePort: LicenceStoragePort;
  let licenceStoragePort: LicenceStoragePort;
  let organizationService: OrganizationService;

  beforeEach(() => {
    mockedGithubAdapterPort = mock<GithubAdapterPort>();
    githubAdapterPort = instance(mockedGithubAdapterPort);
    mockedGitlabAdapterPort = mock<GitlabAdapterPort>();
    gitlabAdapterPort = instance(mockedGitlabAdapterPort);
    mockedLicenceStoragePort = mock<LicenceStoragePort>();
    licenceStoragePort = instance(mockedLicenceStoragePort);
    organizationService = new OrganizationService(
      githubAdapterPort,
      gitlabAdapterPort,
      licenceStoragePort,
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

      const licences = [
        new Licence(PlanEnum.FREE, 'fake-key-12345', vcsOrganizations[0].vcsId),
      ];
      const licencesWithHiddenKey = [
        new Licence(PlanEnum.FREE, '**********2345', vcsOrganizations[0].vcsId),
      ];

      const vcsOrganizationWithHiddenLicenceKey = {
        ...vcsOrganizations[0],
        licence: licencesWithHiddenKey[0],
      } as VcsOrganization;

      jest
        .spyOn(githubAdapterPort, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));
      jest
        .spyOn(licenceStoragePort, 'findForOrganizationIds')
        .mockImplementation(() => Promise.resolve(licences));

      // When
      const organizations = await organizationService.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([vcsOrganizationWithHiddenLicenceKey]);
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

      const licences = [
        new Licence(PlanEnum.FREE, 'fake-key-12345', vcsOrganizations[0].vcsId),
      ];

      const licencesWithHiddenKey = [
        new Licence(PlanEnum.FREE, '**********2345', vcsOrganizations[0].vcsId),
      ];

      const vcsOrganizationWithHiddenLicenceKey = {
        ...vcsOrganizations[0],
        licence: licencesWithHiddenKey[0],
      } as VcsOrganization;

      jest
        .spyOn(gitlabAdapterPort, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));
      jest
        .spyOn(licenceStoragePort, 'findForOrganizationIds')
        .mockImplementation(() => Promise.resolve(licences));

      // When
      const organizations = await organizationService.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([vcsOrganizationWithHiddenLicenceKey]);
    });
  });

  describe('updateLicence', () => {
    it('should not update licence and throw licence key not found exception', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenceKey = uuid();
      const organizationVcsId = faker.datatype.number();

      const persistedLicence = new Licence(
        PlanEnum.APP_SUMO,
        licenceKey,
        faker.datatype.number(),
      );

      // When
      jest
        .spyOn(licenceStoragePort, 'findForLicenceKey')
        .mockImplementation(() => Promise.resolve(persistedLicence));

      let exception = null;
      try {
        await organizationService.updateLicence(
          user,
          organizationVcsId,
          licenceKey,
        );
      } catch (error) {
        exception = error;
      }

      // Then
      expect(exception).toEqual(
        new SymeoException(
          'The licence key has already been used.',
          SymeoExceptionCode.LICENSE_KEY_ALREADY_USED,
        ),
      );
    });

    it('should not update licence and throw licence key already used exception', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenceKey = uuid();
      const organizationVcsId = faker.datatype.number();

      // When
      jest
        .spyOn(licenceStoragePort, 'findForLicenceKey')
        .mockImplementation(() => Promise.resolve(undefined));

      let exception = null;
      try {
        await organizationService.updateLicence(
          user,
          organizationVcsId,
          licenceKey,
        );
      } catch (error) {
        exception = error;
      }

      // Then
      expect(exception).toEqual(
        new SymeoException(
          'Licence key not valid.',
          SymeoExceptionCode.LICENSE_KEY_NOT_FOUND,
        ),
      );
    });

    it('should update licence', async () => {
      // Given
      const user = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const licenceKey = 'fake-licence-key';
      const organizationVcsId = faker.datatype.number();

      // When
      const persistedLicence = new Licence(PlanEnum.APP_SUMO, licenceKey);
      jest
        .spyOn(licenceStoragePort, 'findForLicenceKey')
        .mockImplementation(() => Promise.resolve(persistedLicence));
      const updatedLicence = await organizationService.updateLicence(
        user,
        organizationVcsId,
        licenceKey,
      );

      // Then
      expect(updatedLicence).toEqual({
        ...persistedLicence,
        licenceKey: '************-key',
        organizationVcsId: organizationVcsId,
      } as Licence);
    });
  });
});
