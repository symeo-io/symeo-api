import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import User from 'src/domain/model/user/user.model';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';

export interface RepositoryFacade {
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

  hasAccessToRepository(user: User, repositoryVcsId: number): Promise<boolean>;

  checkFileExistsOnBranch(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<boolean>;

  getFileContent(
    user: User,
    repositoryId: number,
    filePath: string,
    branch: string,
  ): Promise<string | undefined>;
}
