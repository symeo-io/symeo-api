import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ROLES_KEY } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { PermissionRoleService } from 'src/domain/service/permission-role.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RepositoryAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
    @Inject('PermissionRoleService')
    protected readonly permissionRoleService: PermissionRoleService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const requestRepositoryVcsId = request.params.repositoryVcsId;

    const { repository } =
      await this.authorizationService.hasUserAuthorizationToRepository(
        user,
        requestRepositoryVcsId,
      );

    request.repository = repository;

    const minimumEnvironmentPermissionRoleRequired =
      this.reflector.get<EnvironmentPermissionRole>(
        ROLES_KEY,
        context.getHandler(),
      );

    if (minimumEnvironmentPermissionRoleRequired) {
      await this.permissionRoleService.isUserRepositoryPermissionRoleInRequired(
        minimumEnvironmentPermissionRoleRequired,
        user,
        repository,
      );
    }

    return true;
  }
}
