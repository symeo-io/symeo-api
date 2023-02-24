import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetEnvironmentPermissionsResponseDTO } from 'src/application/webapp/dto/environment-permission/get-environment-permissions.response.dto';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import User from 'src/domain/model/user/user.model';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

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
}
