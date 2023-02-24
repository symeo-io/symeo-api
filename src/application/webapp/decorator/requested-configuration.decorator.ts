import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Configuration from 'src/domain/model/configuration/configuration.model';

export const RequestedConfiguration = createParamDecorator(
  (data, ctx: ExecutionContext): Configuration => {
    const req = ctx.switchToHttp().getRequest();
    return req.configuration;
  },
);
