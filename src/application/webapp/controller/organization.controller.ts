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
import { UpdateLicenseResponseDTO } from '../dto/organization/update-license.response.dto';
import { UpdateConfigurationDTO } from '../dto/configuration/update-configuration.dto';
import { UpdateLicenseDTO } from '../dto/organization/update-license.dto';

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
    description: 'Organization license successfully saved',
    type: UpdateLicenseResponseDTO,
  })
  @HttpCode(200)
  @Post('license-key')
  async updateLicense(
    @CurrentUser() user: User,
    @Body() updateLicenseDTO: UpdateLicenseDTO,
  ): Promise<UpdateLicenseResponseDTO> {
    return UpdateLicenseResponseDTO.fromDomain(
      await this.organizationFacade.updateLicense(
        user,
        updateLicenseDTO.organizationId,
        updateLicenseDTO.licenseKey,
      ),
    );
  }
}
