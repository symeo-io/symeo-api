import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import User from 'src/domain/model/user/user.model';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
