import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import User from 'src/domain/model/user/user.model';
import Licence from '../../model/licence/licence.model';

export interface OrganizationFacade {
  getOrganizations(user: User): Promise<VcsOrganization[]>;

  updateLicence(
    user: User,
    organizationId: number,
    licenceKey: string,
  ): Promise<Licence>;
}
