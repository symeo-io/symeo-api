import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/get-environment-values.response.dto';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { SetEnvironmentValuesResponseDTO } from 'src/application/webapp/dto/values/set-environment-values.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import { RequiredEnvironmentPermission } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { RequestedConfiguration } from 'src/application/webapp/decorator/requested-configuration.decorator';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

@Controller('configurations')
@ApiTags('values')
@UseGuards(AuthGuard('jwt'))
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @ApiOkResponse({
    description: 'Environment values successfully retrieved',
    type: GetEnvironmentValuesResponseDTO,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.READ_NON_SECRET)
  async getEnvironmentValuesForWebapp(
    @CurrentUser() user: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @RequestedEnvironment() environment: Environment,
    @Query('branch') branch: string | undefined,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values = await this.valuesFacade.findByEnvironmentForWebapp(
      user,
      repository,
      configuration,
      branch,
      environment,
    );

    return new GetEnvironmentValuesResponseDTO(values);
  }

  @ApiOkResponse({
    description: 'Environment values successfully created',
  })
  @Post(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @HttpCode(200)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.WRITE)
  async setEnvironmentValuesForWebapp(
    @RequestedEnvironment() environment: Environment,
    @Body() setEnvironmentValuesResponseDTO: SetEnvironmentValuesResponseDTO,
  ): Promise<void> {
    await this.valuesFacade.updateByEnvironmentForWebapp(
      environment,
      setEnvironmentValuesResponseDTO.values,
    );
  }
}
