import { Controller, Get, Inject } from '@nestjs/common';
import { OrganizationFacade } from '../../domain/port/in/organization.facade.port';
import { User } from '../../domain/model/user.model';
import { VcsOrganization } from '../../domain/model/vcs.organization.model';
import { OrganizationDTO } from '../dto/organization.dto';

@Controller('user')
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @Get('organizations/github')
  async getOrganizationsForUser(): Promise<VcsOrganization[] | null> {
    const authenticatedUser: User = new User('fake-id'); // TODO : get the authenticated user;
    return OrganizationDTO.fromDomainToContract(
      await this.organizationFacade.getOrganizationsForUser(authenticatedUser),
    );
  }
}
