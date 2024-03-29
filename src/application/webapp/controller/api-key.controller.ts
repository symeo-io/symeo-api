import {
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';
import GetApiKeysResponseDTO from 'src/application/webapp/dto/api-key/get-api-keys.response.dto';
import CreateApiKeyResponseDTO from 'src/application/webapp/dto/api-key/create-api-key.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import { ApiKeyAuthorizationGuard } from 'src/application/webapp/authorization/ApiKeyAuthorizationGuard';
import { RequestedApiKey } from 'src/application/webapp/decorator/requested-api-key.decorator';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { RequiredEnvironmentPermission } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

@Controller('configurations')
@ApiTags('apiKeys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeyController {
  constructor(
    @Inject('ApiKeyFacade')
    private readonly apiKeyFacade: ApiKeyFacade,
  ) {}

  @ApiOkResponse({
    description: 'Api keys successfully retrieved',
    type: GetApiKeysResponseDTO,
  })
  @Get(':repositoryVcsId/:configurationId/environments/:environmentId/api-keys')
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async listApiKeysForEnvironment(
    @RequestedEnvironment() environment: Environment,
  ): Promise<GetApiKeysResponseDTO> {
    const apiKeys = await this.apiKeyFacade.listApiKeysForUserAndEnvironment(
      environment,
    );

    return GetApiKeysResponseDTO.fromDomains(apiKeys);
  }

  @Post(
    ':repositoryVcsId/:configurationId/environments/:environmentId/api-keys',
  )
  @ApiOkResponse({
    description: 'Api keys successfully created',
    type: CreateApiKeyResponseDTO,
  })
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async createApiKeyForEnvironment(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
  ): Promise<CreateApiKeyResponseDTO> {
    const apiKey = await this.apiKeyFacade.createApiKeyForEnvironment(
      currentUser,
      repository,
      environment,
    );

    return CreateApiKeyResponseDTO.fromDomain(apiKey);
  }

  @Delete(
    ':repositoryVcsId/:configurationId/environments/:environmentId/api-keys/:apiKeyId',
  )
  @ApiOkResponse({
    description: 'Api keys successfully deleted',
  })
  @UseGuards(ApiKeyAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async deleteApiKeyForEnvironment(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
    @RequestedApiKey() apiKey: ApiKey,
  ): Promise<void> {
    await this.apiKeyFacade.deleteApiKey(
      currentUser,
      repository,
      environment,
      apiKey,
    );
  }
}
