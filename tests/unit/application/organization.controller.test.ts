import { OrganizationController } from '../../../src/application/controller/organization.controller';
import { OrganizationFacade } from '../../../src/domain/port/in/organization.facade.port';
import { AppClient } from '../../utils/app.client';
import { VcsOrganization } from '../../../src/domain/model/vcs.organization.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from '../../../src/domain/model/vcs-provider.enum';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let organizationFacade: OrganizationFacade;

  const organizationFacadeMock: jest.Mocked<OrganizationFacade> = {
    getOrganizations: jest.fn(),
  };
  const organizationController = new OrganizationController(
    organizationFacadeMock,
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    organizationFacade = appClient.module.get<OrganizationFacade>(
      'OrganizationService',
    );
  });

  afterAll(async () => {
    await appClient.close();
  });

  describe('getOrganizationsForUser()', () => {
    it('should get organizations for a user', () => {
      // Given
      const vcsOrganizations: VcsOrganization[] = [
        new VcsOrganization(
          faker.datatype.number({ min: 1, max: 100 }),
          faker.datatype.string(10),
        ),
        new VcsOrganization(
          faker.datatype.number({ min: 1, max: 100 }),
          faker.datatype.string(10),
        ),
      ];

      // When
      jest
        .spyOn(organizationFacade, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));
      organizationController.getOrganizations();

      // Then
      expect(
        organizationFacade.getOrganizations({
          id: 'fake-id',
          email: 'fake-email',
          provider: VCSProvider.GitHub,
        }),
      ).toBeCalledTimes(1);
    });
  });
});
