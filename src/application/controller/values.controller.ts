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
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { GetEnvironmentValuesResponseDTO } from 'src/application/dto/values/get-environment-values.response.dto';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { SetEnvironmentValuesResponseDTO } from 'src/application/dto/values/set-environment-values.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('configurations')
@UseGuards(AuthGuard('jwt'))
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @Get(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/values',
  )
  async getEnvironmentValues(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values = await this.valuesFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      configurationId,
      environmentId,
    );

    return new GetEnvironmentValuesResponseDTO(values);
  }

  @Post(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/values',
  )
  @HttpCode(200)
  async setEnvironmentValues(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @Body() setEnvironmentValuesResponseDTO: SetEnvironmentValuesResponseDTO,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.valuesFacade.updateByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      configurationId,
      environmentId,
      setEnvironmentValuesResponseDTO.values,
    );
  }
}
