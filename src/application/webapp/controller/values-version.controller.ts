import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EnvironmentAuthorizationGuard } from 'src/application/webapp/authorization/EnvironmentAuthorizationGuard';
import { RequestedEnvironment } from 'src/application/webapp/decorator/requested-environment.decorator';
import Environment from 'src/domain/model/environment/environment.model';
import ValuesVersionFacade from 'src/domain/port/in/values-version.facade';
import { GetValuesVersionsResponseDto } from 'src/application/webapp/dto/values-version/get-values-versions.response.dto';

@Controller('configurations')
@ApiTags('versions')
@UseGuards(AuthGuard('jwt'))
export class ValuesVersionController {
  constructor(
    @Inject('ValuesVersionFacade')
    private readonly versionsFacade: ValuesVersionFacade,
  ) {}

  @ApiOkResponse({
    description: 'Versions of the environment successfully retrieved',
    type: GetValuesVersionsResponseDto,
  })
  @Get(':repositoryVcsId/:configurationId/environments/:environmentId/versions')
  @UseGuards(EnvironmentAuthorizationGuard)
  async getValuesVersions(
    @RequestedEnvironment() environment: Environment,
  ): Promise<GetValuesVersionsResponseDto> {
    return GetValuesVersionsResponseDto.fromDomains(
      await this.versionsFacade.getValuesVersions(environment),
    );
  }
}
