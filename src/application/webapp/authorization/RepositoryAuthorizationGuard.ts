import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { AuthorizationService } from 'src/domain/service/authorization.service';

@Injectable()
export class RepositoryAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
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
    return true;
  }
}
