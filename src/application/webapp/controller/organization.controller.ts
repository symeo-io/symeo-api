import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationFacade } from 'src/domain/port/in/organization.facade.port';
import User from 'src/domain/model/user/user.model';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetOrganizationsResponseDTO } from 'src/application/webapp/dto/organization/get-organizations.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateLicenceResponseDTO } from '../dto/organization/update-licence.response.dto';
import { UpdateLicenceDTO } from '../dto/organization/update-licence.dto';

@Controller('organizations')
@ApiTags('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @ApiOkResponse({
    description: 'Organizations successfully retrieved',
    type: GetOrganizationsResponseDTO,
  })
  @Get()
  async getOrganizations(
    @CurrentUser() user: User,
  ): Promise<GetOrganizationsResponseDTO> {
    return GetOrganizationsResponseDTO.fromDomains(
      await this.organizationFacade.getOrganizations(user),
    );
  }

  @ApiOkResponse({
    description: 'Organization licence successfully saved',
    type: UpdateLicenceResponseDTO,
  })
  @HttpCode(200)
  @Post('licence-key')
  async updateLicence(
    @CurrentUser() user: User,
    @Body() updateLicenceDTO: UpdateLicenceDTO,
  ): Promise<UpdateLicenceResponseDTO> {
    return UpdateLicenceResponseDTO.fromDomain(
      await this.organizationFacade.updateLicence(
        user,
        updateLicenceDTO.organizationId,
        updateLicenceDTO.licenceKey,
      ),
    );
  }
}
