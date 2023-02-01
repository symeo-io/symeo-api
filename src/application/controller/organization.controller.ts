import { Controller, Get, Inject } from '@nestjs/common';
import { OrganizationFacade } from '../../domain/port/in/organization.facade.port';
import { VcsOrganization } from '../../domain/model/vcs.organization.model';
import { OrganizationDTO } from '../dto/organization.dto';
import User from '../../domain/model/user.model';
import { VCSProvider } from '../../domain/model/vcs-provider.enum';

@Controller('user')
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @Get('organizations/github')
  async getOrganizationsForUser(): Promise<VcsOrganization[] | null> {
    const authenticatedUser: User = new User(
      'fake-id',
      'fake-email',
      VCSProvider.GitHub,
    ); // TODO : get the authenticated user;
    return OrganizationDTO.fromDomainToContract(
      await this.organizationFacade.getOrganizationsForUser(authenticatedUser),
    );
  }
}
