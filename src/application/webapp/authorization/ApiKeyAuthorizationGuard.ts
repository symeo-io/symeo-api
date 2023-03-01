import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { ENVIRONMENT_PERMISSIONS_KEY } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyAuthorizationGuard implements CanActivate {
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
    const requestedEnvironmentId = request.params.environmentId;
    const requestedApiKeyId = request.params.apiKeyId;
    const requiredEnvironmentRole =
      this.reflector.get<EnvironmentPermissionRole>(
        ENVIRONMENT_PERMISSIONS_KEY,
        context.getHandler(),
      );

    const { repository, configuration, environment, apiKey } =
      await this.authorizationService.hasUserAuthorizationToApiKey(
        user,
        requestedRepositoryVcsId,
        requestedConfigurationId,
        requestedEnvironmentId,
        requestedApiKeyId,
        requiredEnvironmentRole,
      );

    request.repository = repository;
    request.configuration = configuration;
    request.environment = environment;
    request.apiKey = apiKey;
    return true;
  }
}
