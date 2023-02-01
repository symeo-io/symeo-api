import { VcsOrganization } from '../../model/vcs.organization.model';
import User from '../../model/user.model';

export interface OrganizationFacade {
  getOrganizationsForUser(authenticatedUser: User): Promise<VcsOrganization[]>;
}
