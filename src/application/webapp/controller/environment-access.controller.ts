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
import { GetEnvironmentAccessesResponseDTO } from 'src/application/webapp/dto/environment-access/get-environment-accesses.response.dto';
import { EnvironmentAccessFacade } from 'src/domain/port/in/environment-access.facade.port';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import User from 'src/domain/model/user/user.model';
import { UpdateEnvironmentAccessesDTO } from 'src/application/webapp/dto/environment-access/update-environment-accesses.dto';
import { UpdateEnvironmentAccessesResponseDTO } from 'src/application/webapp/dto/environment-access/update-environment-accesses.response.dto';

@Controller('configurations')
@ApiTags('environment-accesses')
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

  @Post(
    'github/:vcsRepository/:configurationId/environments/:environmentId/environment-accesses',
  )
  async updateEnvironmentAccesses(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('environmentId') environmentId: string,
    @CurrentUser() user: User,
    @Body() updateEnvironmentAccessesDTO: UpdateEnvironmentAccessesDTO,
  ): Promise<UpdateEnvironmentAccessesResponseDTO> {
    return UpdateEnvironmentAccessesResponseDTO.fromDomains(
      await this.environmentAccessFacade.updateEnvironmentAccesses(
        user,
        parseInt(vcsRepositoryId),
        environmentId,
        updateEnvironmentAccessesDTO.toDomain(),
      ),
    );
  }
}
