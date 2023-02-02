import { Controller, Get, Inject, Param } from '@nestjs/common';
import { OrganizationFacade } from 'src/domain/port/in/organization.facade.port';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import { GetOrganizationsResponseDTO } from 'src/application/dto/get-organizations.response.dto';
import { GetRepositoriesResponseDTO } from 'src/application/dto/get-repositories.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';

@Controller('organizations')
export class OrganizationController {
  constructor(
    @Inject('OrganizationFacade')
    private readonly organizationFacade: OrganizationFacade,
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get()
  async getOrganizations(
    @CurrentUser() user: User,
  ): Promise<GetOrganizationsResponseDTO> {
    return GetOrganizationsResponseDTO.fromDomains(
      await this.organizationFacade.getOrganizations(user),
    );
  }

  @Get(':organizationName/repos')
  async getRepositories(
    @Param('organizationName') organizationName: string,
    @CurrentUser() user: User,
  ): Promise<GetRepositoriesResponseDTO> {
    return GetRepositoriesResponseDTO.fromDomains(
      await this.repositoryFacade.getRepositories(user, organizationName),
    );
  }
}
