import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import User from 'src/domain/model/user/user.model';

export interface EnvironmentAccessFacade {
  getEnvironmentAccesses(
    user: User,
    vcsRepositoryId: number,
    environmentId: string,
  ): Promise<EnvironmentAccess[]>;

  updateEnvironmentAccesses(
    user: User,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    environmentAccesses: EnvironmentAccess[],
  ): Promise<EnvironmentAccess[]>;
}
