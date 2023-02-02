import User from '../../model/user.model';
import { VcsOrganization } from '../../model/vcs.organization.model';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';

export default interface GithubAdapterPort {
  getOrganizations(user: User): Promise<VcsOrganization[]>;
  getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]>;
  hasAccessToRepository(user: User, repositoryVcsId: number): Promise<boolean>;
}
