import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';

@Injectable()
export class ConfigurationAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
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
    return true;
  }
}
