import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';
import GetApiKeysResponseDTO from 'src/application/webapp/dto/api-key/get-api-keys.response.dto';
import CreateApiKeyResponseDTO from 'src/application/webapp/dto/api-key/create-api-key.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('configurations')
@ApiTags('apiKeys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeyController {
  constructor(
    @Inject('ApiKeyFacade')
    private readonly apiKeyFacade: ApiKeyFacade,
  ) {}

  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys',
  )
  @ApiOkResponse({
    description: 'Api keys successfully retrieved',
    type: GetApiKeysResponseDTO,
  })
  async listApiKeysForEnvironment(
    @Param('repositoryVcsId') repositoryVcsId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetApiKeysResponseDTO> {
    const apiKeys = await this.apiKeyFacade.listApiKeysForUserAndEnvironment(
      user,
      VCSProvider.GitHub,
      parseInt(repositoryVcsId),
      configurationId,
      environmentId,
    );

    return GetApiKeysResponseDTO.fromDomains(apiKeys);
  }

  @Post(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys',
  )
  @ApiOkResponse({
    description: 'Api keys successfully created',
    type: CreateApiKeyResponseDTO,
  })
  async createApiKeyForEnvironment(
    @Param('repositoryVcsId') repositoryVcsId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<CreateApiKeyResponseDTO> {
    const apiKey = await this.apiKeyFacade.createApiKeyForEnvironment(
      user,
      VCSProvider.GitHub,
      parseInt(repositoryVcsId),
      configurationId,
      environmentId,
    );

    return CreateApiKeyResponseDTO.fromDomain(apiKey);
  }

  @Delete(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys/:apiKeyId',
  )
  @ApiOkResponse({
    description: 'Api keys successfully deleted',
  })
  async deleteApiKeyForEnvironment(
    @Param('repositoryVcsId') repositoryVcsId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @Param('apiKeyId') apiKeyId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.apiKeyFacade.deleteApiKeyForEnvironment(
      user,
      VCSProvider.GitHub,
      parseInt(repositoryVcsId),
      configurationId,
      environmentId,
      apiKeyId,
    );
  }
}
