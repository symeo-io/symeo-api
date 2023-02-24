import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';

@Injectable()
export class ApiKeyAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const requestedRepositoryVcsId = request.params.repositoryVcsId;
    const requestedConfigurationId = request.params.configurationId;
    const requestedEnvironmentId = request.params.environmentId;
    const requestedApiKeyId = request.params.apiKeyId;

    const { repository, configuration, environment, apiKey } =
      await this.authorizationService.hasUserAuthorizationToApiKey(
        user,
        requestedRepositoryVcsId,
        requestedConfigurationId,
        requestedEnvironmentId,
        requestedApiKeyId,
      );

    request.repository = repository;
    request.configuration = configuration;
    request.environment = environment;
    request.apiKey = apiKey;
    return true;
  }
}
