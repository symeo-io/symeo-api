import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';

export interface GitlabAdapterPort {
  getOrganizations(user: User): Promise<VcsOrganization[]>;

  getRepositories(user: User): Promise<VcsRepository[]>;

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

  commitFileToRepositoryBranch(
    user: User,
    repositoryVcsId: number,
    branch: string,
    filePath: string,
    fileContent: string,
    commitMessage: string,
  ): Promise<void>;

  checkFileExistsOnBranch(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean>;
}
