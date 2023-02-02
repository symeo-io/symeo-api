import User from '../../model/user.model';

export interface RepositoryFacade {
  hasAccessToRepository(user: User, repositoryVcsId: number): Promise<boolean>;
}
