import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Environment from 'src/domain/model/environment/environment.model';

export const RequestedApiKey = createParamDecorator(
  (data, ctx: ExecutionContext): Environment => {
    const req = ctx.switchToHttp().getRequest();
    return req.apiKey;
  },
);
