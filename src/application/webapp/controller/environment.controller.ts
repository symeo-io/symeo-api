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
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { RequiredEnvironmentPermission } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { RequiredRepositoryRole } from 'src/application/webapp/decorator/repository-role.decorator';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

@Controller('configurations')
@ApiTags('environments')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentController {
  constructor(
    @Inject('EnvironmentFacade')
    private readonly environmentFacade: EnvironmentFacade,
  ) {}

  @Patch(':repositoryVcsId/:configurationId/environments/:environmentId')
  @ApiOkResponse({
    description: 'Environment successfully updated',
    type: UpdateEnvironmentResponseDTO,
  })
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async updateEnvironment(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
    @Body() updateEnvironmentDTO: UpdateEnvironmentDTO,
  ): Promise<UpdateEnvironmentResponseDTO> {
    const updatedEnvironment = await this.environmentFacade.updateEnvironment(
      currentUser,
      repository,
      environment,
      updateEnvironmentDTO.name,
      updateEnvironmentDTO.color,
    );
    return UpdateEnvironmentResponseDTO.fromDomain(updatedEnvironment);
  }

  @ApiOkResponse({
    description: 'Environment successfully deleted',
  })
  @Delete(':repositoryVcsId/:configurationId/environments/:environmentId')
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async deleteEnvironment(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
  ): Promise<void> {
    await this.environmentFacade.deleteEnvironment(
      currentUser,
      repository,
      environment,
    );
  }

  @ApiResponse({ status: 200 })
  @ApiOkResponse({
    description: 'Environment successfully created',
    type: CreateEnvironmentResponseDTO,
  })
  @Post(':repositoryVcsId/:configurationId/environments')
  @UseGuards(ConfigurationAuthorizationGuard)
  @RequiredRepositoryRole(VcsRepositoryRole.ADMIN)
  async createEnvironment(
    @CurrentUser() currentUser: User,
    @RequestedRepository() repository: VcsRepository,
    @RequestedConfiguration() configuration: Configuration,
    @Body() createEnvironmentDTO: CreateEnvironmentDTO,
  ): Promise<CreateEnvironmentResponseDTO> {
    const environment = await this.environmentFacade.createEnvironment(
      currentUser,
      repository,
      configuration,
      createEnvironmentDTO.name,
      createEnvironmentDTO.color,
    );
    return CreateEnvironmentResponseDTO.fromDomain(environment);
  }
}
