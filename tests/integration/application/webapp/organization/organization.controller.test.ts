import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoriesMock } from 'tests/utils/mocks/fetch-vcs-repositories.mock';
import { FetchAuthenticatedUserMock } from 'tests/utils/mocks/fetch-authenticated-user.mock';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';
import { LicenseTestUtil } from '../../../../utils/entities/license.test.util';
import License from '../../../../../src/domain/model/license/license.model';
import { PlanEnum } from '../../../../../src/domain/model/license/plan.enum';
import { v4 as uuid } from 'uuid';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoriesMock: FetchVcsRepositoriesMock;
  let fetchAuthenticatedUserMock: FetchAuthenticatedUserMock;
  let licenseTestUtilMock: LicenseTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();
    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchVcsRepositoriesMock = new FetchVcsRepositoriesMock(appClient);
    fetchAuthenticatedUserMock = new FetchAuthenticatedUserMock(appClient);
    licenseTestUtilMock = new LicenseTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
    await licenseTestUtilMock.empty();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /organizations', () => {
    describe('For Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      it('should respond 200 with github repository', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGithubRepositoryPresent();
        await licenseTestUtilMock.createLicense(
          new License(PlanEnum.APP_SUMO, 'license-test-12345', 1),
        );
        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 1,
                name: 'octocat',
                displayName: 'octocat',
                avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
                settings: {
                  plan: PlanEnum.APP_SUMO,
                  licenseKey: '**************2345',
                },
              },
            ],
          });
      });

      it('should respond 200 with github organization when no repositories and no license', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGithubRepositoryNotPresent();
        fetchAuthenticatedUserMock.mockGithubAuthenticatedPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 1,
                name: 'octocat',
                displayName: 'octocat',
                avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
                settings: {
                  plan: PlanEnum.FREE,
                  licenseKey: null,
                },
              },
            ],
          });
      });
    });

    describe('For Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );

      it('should respond 200 with gitlab repository', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGitlabRepositoryPresent();
        await licenseTestUtilMock.createLicense(
          new License(PlanEnum.APP_SUMO, 'license-test-12345', 65616175),
        );

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 65616175,
                name: 'dfrances-test',
                displayName: 'dfrances-test',
                avatarUrl:
                  '/uploads/-/system/group/avatar/65616175/gitlab8368.jpeg',
                settings: {
                  plan: PlanEnum.APP_SUMO,
                  licenseKey: '**************2345',
                },
              },
            ],
          });
      });

      it('should respond 200 with gitlab organization when no repositories', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGitlabRepositoryNotPresent();
        fetchAuthenticatedUserMock.mockGitlabAuthenticatedPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 12917479,
                name: 'DorianSymeo',
                displayName: 'Dorian Frances',
                avatarUrl:
                  'https://secure.gravatar.com/avatar/84a0b53a86a1f2bf0ddbbd85156631de?s=80&d=identicon',
                settings: {
                  plan: PlanEnum.FREE,
                  licenseKey: null,
                },
              },
            ],
          });
      });
    });
  });

  describe('(POST) /organizations/license-key', () => {
    const currentUser = new User(
      `github|${faker.datatype.number()}`,
      faker.internet.email(),
      faker.internet.userName(),
      VCSProvider.GitHub,
      faker.datatype.number(),
    );

    it('should respond 404 for invalid license key', async () => {
      // Given
      const licenseKey = 'license-test-12345';
      const organizationVcsId = faker.datatype.number();
      const updateLicenseDTO = {
        organizationId: organizationVcsId,
        licenseKey: licenseKey,
      };
      await licenseTestUtilMock.createLicense(
        new License(PlanEnum.APP_SUMO, uuid()),
      );
      return appClient
        .request(currentUser)
        .post(`/api/v1/organizations/license-key`)
        .send(updateLicenseDTO)
        .expect(404);
    });

    it('should respond 400 for license key already used', async () => {
      // Given
      const licenseKey = 'license-test-12345';
      const organizationVcsId = faker.datatype.number();
      const updateLicenseDTO = {
        organizationId: organizationVcsId,
        licenseKey: licenseKey,
      };
      await licenseTestUtilMock.createLicense(
        new License(PlanEnum.APP_SUMO, licenseKey, faker.datatype.number()),
      );
      return appClient
        .request(currentUser)
        .post(`/api/v1/organizations/license-key`)
        .send(updateLicenseDTO)
        .expect(400);
    });

    it('should respond 200 with new license', async () => {
      // Given
      const licenseKey = 'license-test-12345';
      const organizationVcsId = faker.datatype.number();
      const updateLicenseDTO = {
        organizationId: organizationVcsId,
        licenseKey: licenseKey,
      };
      await licenseTestUtilMock.createLicense(
        new License(PlanEnum.APP_SUMO, licenseKey),
      );
      return appClient
        .request(currentUser)
        .post(`/api/v1/organizations/license-key`)
        .send(updateLicenseDTO)
        .expect(200)
        .expect({
          license: {
            plan: PlanEnum.APP_SUMO,
            licenseKey: '**************2345',
          },
        });
    });
  });
});
