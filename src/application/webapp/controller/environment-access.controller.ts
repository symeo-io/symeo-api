import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetEnvironmentAccessesResponseDTO } from 'src/application/webapp/dto/environment-access/get-environment-accesses.response.dto';
import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('configurations')
@ApiTags('rights')
@UseGuards(AuthGuard('jwt'))
export class RightController {
  constructor(
    @Inject('RightFacade') private rightFacade: EnvironmentAccessFacade,
  ) {}

  @Get(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/environment-accesses',
  )
  @ApiOkResponse({
    description: 'Members environment access successfully retrieved',
    type: GetEnvironmentAccessesResponseDTO,
  })
  async getRights(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetEnvironmentAccessesResponseDTO> {
    return GetEnvironmentAccessesResponseDTO.fromDomains(
      await this.rightFacade.getEnvironmentAccesses(
        user,
        parseInt(vcsRepositoryId),
      ),
    );
  }
}
