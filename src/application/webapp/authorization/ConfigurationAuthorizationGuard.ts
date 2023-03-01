import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';
import { Reflector } from '@nestjs/core';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { REPOSITORY_ROLES_KEY } from 'src/application/webapp/decorator/repository-role.decorator';

@Injectable()
export class ConfigurationAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const requestedRepositoryVcsId = request.params.repositoryVcsId;
    const requestedConfigurationId = request.params.configurationId;
    const requiredRepositoryRole = this.reflector.get<VcsRepositoryRole>(
      REPOSITORY_ROLES_KEY,
      context.getHandler(),
    );

    const { repository, configuration } =
      await this.authorizationService.hasUserAuthorizationToConfiguration(
        user,
        requestedRepositoryVcsId,
        requestedConfigurationId,
        requiredRepositoryRole,
      );

    request.repository = repository;
    request.configuration = configuration;

    return true;
  }
}
