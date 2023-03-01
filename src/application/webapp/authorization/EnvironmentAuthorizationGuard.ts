import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';
import { PermissionRoleService } from 'src/domain/service/permission-role.service';
import { Reflector } from '@nestjs/core';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ENVIRONMENT_PERMISSIONS_KEY } from 'src/application/webapp/decorator/environment-permission-role.decorator';

@Injectable()
export class EnvironmentAuthorizationGuard implements CanActivate {
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
    const requestedEnvironmentId = request.params.environmentId;

    const { repository, configuration, environment } =
      await this.authorizationService.hasUserAuthorizationToEnvironment(
        user,
        requestedRepositoryVcsId,
        requestedConfigurationId,
        requestedEnvironmentId,
      );

    request.repository = repository;
    request.configuration = configuration;
    request.environment = environment;

    const minimumEnvironmentPermissionRoleRequired =
      this.reflector.get<EnvironmentPermissionRole>(
        ENVIRONMENT_PERMISSIONS_KEY,
        context.getHandler(),
      );

    if (minimumEnvironmentPermissionRoleRequired) {
      await this.permissionRoleService.isUserEnvironmentPermissionRoleInRequired(
        minimumEnvironmentPermissionRoleRequired,
        user,
        repository,
        configuration,
        environment,
      );
    }

    return true;
  }
}
