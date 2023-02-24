import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import User from 'src/domain/model/user/user.model';
import { CheckAuthorizationService } from 'src/domain/service/check-authorization.service';

@Injectable()
export class RepositoryAuthorizationGuard implements CanActivate {
  constructor(
    @Inject('CheckAuthorizationService')
    private readonly checkAuthorizationService: CheckAuthorizationService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const requestRepositoryVcsId = request.params.repositoryVcsId;

    request.repository =
      this.checkAuthorizationService.hasUserAuthorizationToRepository(
        user,
        requestRepositoryVcsId,
      );
    return true;
  }
}
