import { Controller, Get, Inject } from '@nestjs/common';
import { OrganizationFacade } from '../../domain/port/in/organization.facade.port';
import { VcsOrganization } from '../../domain/model/vcs.organization.model';
import { OrganizationDTO } from '../dto/organization.dto';
import User from '../../domain/model/user.model';
import { VCSProvider } from '../../domain/model/vcs-provider.enum';
import { CurrentUser } from '../decorator/current-user.decorator';

@Controller('user')
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @Get('organizations/github')
  async getOrganizationsForUser(
    @CurrentUser() user: User,
  ): Promise<VcsOrganization[] | null> {
    return OrganizationDTO.fromDomainToContract(
      await this.organizationFacade.getOrganizationsForUser(user),
    );
  }
}
