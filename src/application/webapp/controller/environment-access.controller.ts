import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetEnvironmentAccessesResponseDTO } from 'src/application/webapp/dto/environment-access/get-environment-accesses.response.dto';
import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('configurations')
@ApiTags('environment-access')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentAccessController {
  constructor(
    @Inject('EnvironmentAccessFacade')
    private environmentAccessFacade: EnvironmentAccessFacade,
  ) {}

  @Get(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/environment-accesses',
  )
  @ApiOkResponse({
    description: 'Members environment access successfully retrieved',
    type: GetEnvironmentAccessesResponseDTO,
  })
  async getEnvironmentAccesses(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentAccessesResponseDTO> {
    return GetEnvironmentAccessesResponseDTO.fromDomains(
      await this.environmentAccessFacade.getEnvironmentAccesses(
        user,
        parseInt(vcsRepositoryId),
        environmentId,
      ),
    );
  }
}
