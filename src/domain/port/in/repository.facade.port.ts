import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import User from 'src/domain/model/user.model';

export interface RepositoryFacade {
  getRepositories(
    user: User,
    organizationName: string,
  ): Promise<VcsRepository[]>;
}
