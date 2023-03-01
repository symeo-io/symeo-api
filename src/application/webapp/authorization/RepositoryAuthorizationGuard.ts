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
export class RepositoryAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('AuthorizationService')
    protected readonly authorizationService: AuthorizationService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const requestRepositoryVcsId = request.params.repositoryVcsId;
    const requiredRepositoryRole = this.reflector.get<VcsRepositoryRole>(
      REPOSITORY_ROLES_KEY,
      context.getHandler(),
    );

    const { repository } =
      await this.authorizationService.hasUserAuthorizationToRepository(
        user,
        requestRepositoryVcsId,
        requiredRepositoryRole,
      );

    request.repository = repository;

    return true;
  }
}
