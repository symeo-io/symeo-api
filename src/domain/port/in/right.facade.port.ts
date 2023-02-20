import User from 'src/domain/model/user.model';
import { Right } from 'src/domain/model/right/right.model';

export interface RightFacade {
  getRights(user: User, vcsRepositoryId: number): Promise<Right[]>;
}
