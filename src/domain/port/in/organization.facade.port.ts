import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import User from 'src/domain/model/user/user.model';
import License from '../../model/license/license.model';

export interface OrganizationFacade {
  getOrganizations(user: User): Promise<VcsOrganization[]>;

  updateLicense(
    user: User,
    organizationId: number,
    licenseKey: string,
  ): Promise<License>;
}
