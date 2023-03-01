import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import User from 'src/domain/model/user/user.model';
import Environment from 'src/domain/model/environment/environment.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';

export interface EnvironmentPermissionFacade {
  getEnvironmentPermissionUsers(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermissionWithUser[]>;

  updateEnvironmentPermissions(
    user: User,
    repository: VcsRepository,
    environmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]>;
}
