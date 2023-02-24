import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import User from 'src/domain/model/user/user.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import Environment from 'src/domain/model/environment/environment.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export interface EnvironmentPermissionFacade {
  getEnvironmentPermissions(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermission[]>;

  updateEnvironmentPermissions(
    user: User,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    environmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]>;
}
