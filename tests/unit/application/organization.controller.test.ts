import { OrganizationController } from '../../../src/application/controller/organization.controller';
import { OrganizationFacade } from '../../../src/domain/port/in/organization.facade.port';

describe('OrganizationController', () => {
  const organizationFacadeMock: jest.Mocked<OrganizationFacade> = {
    getOrganizationsForUser: jest.fn(),
  };
  const organizationController = new OrganizationController(
    organizationFacadeMock,
  );
  describe('getOrganizationsForUser()', () => {
    it('should get organizations for a user', () => {
      // Given
      organizationController.getOrganizationsForUser();
      expect(organizationFacadeMock).toBeCalledTimes(1);
    });
  });
});
