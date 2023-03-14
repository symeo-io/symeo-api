import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import EnvironmentVersionFacade from 'src/domain/port/in/environment-version.facade';
import { GetEnvironmentVersionsResponseDTO } from 'src/application/webapp/dto/environment-version/get-environment-versions.response.dto';

@Controller('configurations')
@ApiTags('versions')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentVersionController {
  constructor(
    @Inject('EnvironmentVersionFacade')
    private readonly versionsFacade: EnvironmentVersionFacade,
  ) {}

  @ApiOkResponse({
    description: 'Versions of the environment successfully retrieved',
    type: GetEnvironmentVersionsResponseDTO,
  })
  @Get(
    'github/:repositoryVcsId/:configurationId/environments/:environmentId/versions',
  )
  @UseGuards(EnvironmentAuthorizationGuard)
  async getEnvironmentVersions(
    @RequestedEnvironment() environment: Environment,
  ): Promise<GetEnvironmentVersionsResponseDTO> {
    return GetEnvironmentVersionsResponseDTO.fromDomains(
      await this.versionsFacade.getEnvironmentVersions(environment),
    );
  }
}
