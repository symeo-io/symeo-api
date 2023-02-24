import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';

@Injectable()
export class EnvironmentAuthorizationGuard implements CanActivate {
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
    return true;
  }
}
