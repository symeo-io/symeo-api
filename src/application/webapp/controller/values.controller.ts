import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/get-environment-values.response.dto';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { SetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/set-environment-values.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('configurations')
@ApiTags('values')
@UseGuards(AuthGuard('jwt'))
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @ApiOkResponse({
    description: 'Environment values successfully retrieved',
    type: GetEnvironmentValuesResponseDTO,
  })
  async getEnvironmentValues(
    @Param('repositoryVcsId') repositoryVcsId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values = await this.valuesFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(repositoryVcsId),
      configurationId,
      environmentId,
    );

    return new GetEnvironmentValuesResponseDTO(values);
  }

  @Post(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @ApiOkResponse({
    description: 'Environment values successfully created',
  })
  @HttpCode(200)
  async setEnvironmentValues(
    @Param('repositoryVcsId') repositoryVcsId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @Body() setEnvironmentValuesResponseDTO: SetEnvironmentValuesResponseDTO,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.valuesFacade.updateByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(repositoryVcsId),
      configurationId,
      environmentId,
      setEnvironmentValuesResponseDTO.values,
    );
  }
}
