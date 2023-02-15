import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { OrganizationFacade } from 'src/domain/port/in/organization.facade.port';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetOrganizationsResponseDTO } from 'src/application/webapp/dto/organization/get-organizations.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('organizations')
@ApiTags('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @Get()
  async getOrganizations(
    @CurrentUser() user: User,
  ): Promise<GetOrganizationsResponseDTO> {
    return GetOrganizationsResponseDTO.fromDomains(
      await this.organizationFacade.getOrganizations(user),
    );
  }
}
