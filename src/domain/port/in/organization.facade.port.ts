import { User } from '../../model/user.model';
import { VcsOrganization } from '../../model/vcs.organization.model';

export interface OrganizationFacade {
  getOrganizationsForUser(authenticatedUser: User): Promise<VcsOrganization[]>;
}
