import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import User from 'src/domain/model/user/user.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';

export interface EnvironmentPermissionFacade {
  getEnvironmentPermissions(
    user: User,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<EnvironmentPermission[]>;
}
