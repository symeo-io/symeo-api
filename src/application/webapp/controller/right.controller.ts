import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetRightsResponseDTO } from 'src/application/webapp/dto/right/get-rights.response.dto';
import { RightFacade } from 'src/domain/port/in/right.facade.port';

@Controller('configurations')
@UseGuards(AuthGuard('jwt'))
export class RightController {
  constructor(@Inject('RightFacade') private rightFacade: RightFacade) {}

  @Get(
    'github/:vcsRepositoryId/:configurationId/environments/:environmentId/rights',
  )
  async getRights(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
  ): Promise<GetRightsResponseDTO> {
    return GetRightsResponseDTO.fromDomains(
      await this.rightFacade.getRights(user, parseInt(vcsRepositoryId)),
    );
  }
}
