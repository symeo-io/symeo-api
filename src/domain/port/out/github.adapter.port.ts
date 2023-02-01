import User from '../../model/user.model';
import { VcsOrganization } from '../../model/vcs.organization.model';

export default interface GithubAdapterPort {
  getOrganizations(user: User): Promise<VcsOrganization[]>;
}
