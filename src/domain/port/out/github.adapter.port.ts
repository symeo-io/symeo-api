import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import User from 'src/domain/model/user/user.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';

export default interface GithubAdapterPort {
  getOrganizations(user: User): Promise<VcsOrganization[]>;
  getRepositories(user: User): Promise<VcsRepository[]>;
  hasAccessToRepository(user: User, repositoryVcsId: number): Promise<boolean>;
  getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined>;

  getBranchByRepositoryId(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsBranch[]>;

  checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean>;

  getFileContent(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<string | undefined>;

  getCollaboratorsForRepository(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
  ): Promise<VcsUser[]>;
}
