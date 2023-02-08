import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { OrganizationFacade } from 'src/domain/port/in/organization.facade.port';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import { GetOrganizationsResponseDTO } from 'src/application/dto/organization/get-organizations.response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('organizations')
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
