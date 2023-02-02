import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import User from 'src/domain/model/user.model';

export interface RepositoryFacade {
  getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]>;

  getRepositoryById(
    user: User,
    repositoryVcsId: number,
  ): Promise<VcsRepository | undefined>;

  hasAccessToRepository(user: User, repositoryVcsId: number): Promise<boolean>;

  checkFileExistsOnBranch(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    filePath: string,
    branch: string,
  ): Promise<boolean>;
}
