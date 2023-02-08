import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { base64decode } from 'nodejs-base64';
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

      const keyHeaderString = apiKey.split('.')[0];
      const keyHeader = JSON.parse(base64decode(keyHeaderString));

      if (!keyHeader.environmentId || !keyHeader.id) {
        return false;
      }

      const foundApiKey = await this.apiKeyFacade.findApiKeyById(
        keyHeader.environmentId,
        keyHeader.id,
      );

      if (!foundApiKey) {
        return false;
      }

      if (!foundApiKey.key === apiKey) {
        false;
      }

      request.environmentId = keyHeader.environmentId;
      return true;
    } catch (e) {
      return false;
    }
  }
}
