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
export class ConfigurationAuthorizationGuard implements CanActivate {
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
    const requestedRepositoryVcsId = request.params.repositoryVcsId;
    const requestedConfigurationId = request.params.configurationId;

    const { repository, configuration } =
      await this.authorizationService.hasUserAuthorizationToConfiguration(
        user,
        requestedRepositoryVcsId,
        requestedConfigurationId,
      );

    request.repository = repository;
    request.configuration = configuration;

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
