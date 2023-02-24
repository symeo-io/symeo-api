import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetEnvironmentPermissionsResponseDTO } from 'src/application/webapp/dto/environment-permission/get-environment-permissions.response.dto';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import User from 'src/domain/model/user/user.model';
import { UpdateEnvironmentPermissionsDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permissions.dto';
import { UpdateEnvironmentPermissionsResponseDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permissions.response.dto';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';

@Controller('configurations')
@ApiTags('environment-permissions')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentPermissionController {
  constructor(
    @Inject('EnvironmentPermissionFacade')
    private environmentPermissionFacade: EnvironmentPermissionFacade,
  ) {}

  @ApiOkResponse({
    description: 'Members environment permissions successfully retrieved',
    type: GetEnvironmentPermissionsResponseDTO,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  async getEnvironmentPermissions(
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentPermissionsResponseDTO> {
    return GetEnvironmentPermissionsResponseDTO.fromDomains(
      await this.environmentPermissionFacade.getEnvironmentPermissions(
        user,
        repository,
        environment,
      ),
    );
  }

  @Post(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/permissions',
  )
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Members environment permissions successfully updated',
    type: UpdateEnvironmentPermissionsResponseDTO,
  })
  @UseGuards(EnvironmentAuthorizationGuard)
  async updateEnvironmentPermissions(
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
    @CurrentUser() user: User,
    @Body() updateEnvironmentPermissionsDTO: UpdateEnvironmentPermissionsDTO,
  ): Promise<UpdateEnvironmentPermissionsResponseDTO> {
    const environmentPermissions: EnvironmentPermission[] =
      await this.environmentPermissionFacade.updateEnvironmentPermissions(
        user,
        repository,
        environment,
        UpdateEnvironmentPermissionsDTO.toDomains(
          updateEnvironmentPermissionsDTO.environmentPermissionsDTO,
        ),
      );
    return UpdateEnvironmentPermissionsResponseDTO.fromDomains(
      environmentPermissions,
    );
  }
}
