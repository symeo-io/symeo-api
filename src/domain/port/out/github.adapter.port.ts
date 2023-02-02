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
  getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined>;

  checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean>;
}
