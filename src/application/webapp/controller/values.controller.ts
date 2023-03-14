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
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'branch', required: false })
  @ApiQuery({ name: 'versionId', required: false })
  async getEnvironmentValuesForWebapp(
    @CurrentUser() user: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @RequestedEnvironment() environment: Environment,
    @Query('branch') branch: string | undefined,
    @Query('versionId') versionId: string | undefined,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values =
      await this.valuesFacade.getHiddenValuesByEnvironmentForWebapp(
        user,
        repository,
        configuration,
        branch,
        environment,
        versionId,
      );

    return new GetEnvironmentValuesResponseDTO(values);
  }

  @ApiOkResponse({
    description: 'Environment secret values successfully retrieved',
    type: GetEnvironmentValuesResponseDTO,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/values/secrets',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.READ_SECRET)
  @ApiQuery({ name: 'branch', required: false })
  @ApiQuery({ name: 'versionId', required: false })
  async getEnvironmentValuesSecretsForWebapp(
    @CurrentUser() user: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @RequestedEnvironment() environment: Environment,
    @Query('branch') branch: string | undefined,
    @Query('versionId') versionId: string | undefined,
  ): Promise<GetEnvironmentValuesResponseDTO> {
    const values =
      await this.valuesFacade.getNonHiddenValuesByEnvironmentForWebapp(
        user,
        repository,
        configuration,
        branch,
        environment,
        versionId,
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
  @ApiQuery({ name: 'branch', required: false })
  @ApiQuery({ name: 'versionId', required: false })
  async setEnvironmentValuesForWebapp(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @RequestedEnvironment() environment: Environment,
    @Body() setEnvironmentValuesResponseDTO: SetEnvironmentValuesResponseDTO,
    @Query('branch') branch: string | undefined,
    @Query('versionId') versionId: string | undefined,
  ): Promise<void> {
    await this.valuesFacade.updateValuesByEnvironmentForWebapp(
      currentUser,
      repository,
      configuration,
      environment,
      branch,
      setEnvironmentValuesResponseDTO.values,
      versionId,
    );
  }
}
