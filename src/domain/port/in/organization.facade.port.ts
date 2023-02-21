import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import User from 'src/domain/model/user/user.model';

export interface OrganizationFacade {
  getOrganizations(user: User): Promise<VcsOrganization[]>;
}
