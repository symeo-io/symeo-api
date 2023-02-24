import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetEnvironmentPermissionsResponseDTO } from 'src/application/webapp/dto/environment-permission/get-environment-permissions.response.dto';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import User from 'src/domain/model/user/user.model';

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
    'github/:vcsRepository/:configurationId/environments/:environmentId/environment-permissions',
  )
  async updateEnvironmentPermissions(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
    @Body() updateEnvironmentPermissionsDTO: UpdateEnvironmentPermissionsDTO,
  ): Promise<UpdateEnvironmentPermissionsResponseDTO> {
    return UpdateEnvironmentPermissionsResponseDTO.fromDomains(
      await this.environmentPermissionFacade.updateEnvironmentPermissions(
        user,
        parseInt(vcsRepositoryId),
        configurationId,
        environmentId,
        updateEnvironmentPermissionsDTO.toDomain(),
      ),
    );
  }
}
