import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export const RequestedRepository = createParamDecorator(
  (data, ctx: ExecutionContext): VcsRepository => {
    const req = ctx.switchToHttp().getRequest();
    return req.repository;
  },
);
