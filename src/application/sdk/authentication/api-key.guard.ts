import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';

export type RequestWithEnvironmentId = Request & {
  environmentId: string;
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject('ApiKeyFacade')
    private readonly apiKeyFacade: ApiKeyFacade,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const apiKey =
        request.headers['X-API-KEY'] || request.headers['x-api-key'];

      if (!apiKey) {
        return false;
      }

      const foundApiKey = await this.apiKeyFacade.findApiKeyByKeyValue(apiKey);

      if (!foundApiKey) {
        return false;
      }

      request.environmentId = foundApiKey.environmentId;
      return true;
    } catch (e) {
      return false;
    }
  }
}
