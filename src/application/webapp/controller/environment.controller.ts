import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import { UpdateEnvironmentResponseDTO } from 'src/application/webapp/dto/configuration/update-environment.response.dto';
import { CreateEnvironmentDTO } from 'src/application/webapp/dto/environment/create-environment.dto';
import { CreateEnvironmentResponseDTO } from 'src/application/webapp/dto/configuration/create-environment.response.dto';
import { EnvironmentFacade } from 'src/domain/port/in/environment.facade.port';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import { ConfigurationAuthorizationGuard } from 'src/application/webapp/authorization/ConfigurationAuthorizationGuard';
import { RequestedConfiguration } from 'src/application/webapp/decorator/requested-configuration.decorator';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { MinimumEnvironmentPermissionRoleRequired } from 'dist/application/webapp/decorator/environment-permission-role.decorator';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

@Controller('configurations')
@ApiTags('environments')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentController {
  constructor(
    @Inject('EnvironmentFacade')
    private readonly environmentFacade: EnvironmentFacade,
  ) {}

  @Patch('github/:repositoryVcsId/:configurationId/environments/:environmentId')
  @ApiOkResponse({
    description: 'Environment successfully updated',
    type: UpdateEnvironmentResponseDTO,
  })
  @UseGuards(EnvironmentAuthorizationGuard)
  @MinimumEnvironmentPermissionRoleRequired(EnvironmentPermissionRole.ADMIN)
  async updateEnvironment(
    @RequestedEnvironment() environment: Environment,
    @Body() updateEnvironmentDTO: UpdateEnvironmentDTO,
  ): Promise<UpdateEnvironmentResponseDTO> {
    const updatedEnvironment = await this.environmentFacade.updateEnvironment(
      environment,
      updateEnvironmentDTO.name,
      updateEnvironmentDTO.color,
    );
    return UpdateEnvironmentResponseDTO.fromDomain(updatedEnvironment);
  }

  @ApiOkResponse({
    description: 'Environment successfully deleted',
  })
  @Delete(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @MinimumEnvironmentPermissionRoleRequired(EnvironmentPermissionRole.ADMIN)
  async deleteEnvironment(
    @RequestedEnvironment() environment: Environment,
  ): Promise<void> {
    await this.environmentFacade.deleteEnvironment(environment);
  }

  @ApiResponse({ status: 200 })
  @ApiOkResponse({
    description: 'Environment successfully created',
    type: CreateEnvironmentResponseDTO,
  })
  @Post('github/:repositoryVcsId/:configurationId/environments')
  @UseGuards(ConfigurationAuthorizationGuard)
  @MinimumEnvironmentPermissionRoleRequired(EnvironmentPermissionRole.ADMIN)
  async createEnvironment(
    @RequestedConfiguration() configuration: Configuration,
    @Body() createEnvironmentDTO: CreateEnvironmentDTO,
  ): Promise<CreateEnvironmentResponseDTO> {
    const environment = await this.environmentFacade.createEnvironment(
      configuration,
      createEnvironmentDTO.name,
      createEnvironmentDTO.color,
    );
    return CreateEnvironmentResponseDTO.fromDomain(environment);
  }
}
