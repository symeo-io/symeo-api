import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import User from 'src/domain/model/user/user.model';
import Environment from 'src/domain/model/environment/environment.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import Configuration from 'src/domain/model/configuration/configuration.model';

export interface EnvironmentPermissionFacade {
  getEnvironmentPermissionUsers(
    user: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<EnvironmentPermissionWithUser[]>;

  getEnvironmentPermissionRole(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
  ): Promise<EnvironmentPermissionRole>;

  findForConfigurationAndUser(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]>;

  updateEnvironmentPermissions(
    user: User,
    repository: VcsRepository,
    environmentPermissions: EnvironmentPermission[],
  ): Promise<EnvironmentPermission[]>;
}
