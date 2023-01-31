import { User } from '../../model/user.model';
import { VcsOrganization } from '../../model/vcs.organization.model';

export default interface GithubAdapterPort {
  collectRepositoriesForVcsOrganization(
    vcsOrganizationName: string,
  ): Promise<void>;

  getOrganizationsForUser(authenticatedUser: User): Promise<VcsOrganization[]>;
}
