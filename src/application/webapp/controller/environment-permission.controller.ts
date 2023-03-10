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
import { GetEnvironmentPermissionsResponseDto } from 'src/application/webapp/dto/environment-permission/get-environment-permissions.response.dto';
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
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { RequiredEnvironmentPermission } from 'src/application/webapp/decorator/environment-permission-role.decorator';

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
    type: GetEnvironmentPermissionsResponseDto,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
  async getEnvironmentPermissions(
    @RequestedRepository() repository: VcsRepository,
    @RequestedEnvironment() environment: Environment,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentPermissionsResponseDto> {
    return GetEnvironmentPermissionsResponseDto.fromDomains(
      await this.environmentPermissionFacade.getEnvironmentPermissionUsers(
        user,
        repository,
        environment,
      ),
    );
  }

  @Post(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions',
  )
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Members environment permissions successfully updated',
    type: UpdateEnvironmentPermissionsResponseDTO,
  })
  @UseGuards(EnvironmentAuthorizationGuard)
  @RequiredEnvironmentPermission(EnvironmentPermissionRole.ADMIN)
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
          updateEnvironmentPermissionsDTO.permissions,
          environment.id,
        ),
      );
    return UpdateEnvironmentPermissionsResponseDTO.fromDomains(
      environmentPermissions,
    );
  }
}
