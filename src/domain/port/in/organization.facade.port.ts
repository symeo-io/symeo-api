import { VcsOrganization } from '../../model/vcs.organization.model';
import User from '../../model/user.model';

export interface OrganizationFacade {
  getOrganizations(user: User): Promise<VcsOrganization[]>;
}
