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
import { VcsRepositoryRoleEnum } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { REPOSITORY_ROLES_KEY } from 'src/application/webapp/decorator/repository-role.decorator';

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

    const minimumVcsRepositoryRoleRequired =
      this.reflector.get<VcsRepositoryRoleEnum>(
        REPOSITORY_ROLES_KEY,
        context.getHandler(),
      );

    if (minimumVcsRepositoryRoleRequired) {
      await this.permissionRoleService.isUserVcsRepositoryRoleInRequired(
        minimumVcsRepositoryRoleRequired,
        user,
        repository,
      );
    }

    return true;
  }
}
