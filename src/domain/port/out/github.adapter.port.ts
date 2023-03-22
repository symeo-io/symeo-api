import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import User from 'src/domain/model/user/user.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';

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

  getEnvFilesForRepositoryIdAndBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
  ): Promise<EnvFile[]>;

  checkFileExistsOnBranch(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean>;

  getFileContent(
    user: User,
    repositoryVcsId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined>;

  getCollaboratorsForRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsUser[]>;

  getUserRepositoryRole(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepositoryRole | undefined>;
}
