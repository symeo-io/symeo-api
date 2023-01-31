import { Controller, Get, Inject, Param } from '@nestjs/common';
import RepositoryFacade from '../../domain/port/in/repository.facade.port';

@Controller()
export class RepositoryController {
  constructor(
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get('repositories')
  async collectRepositoriesForVcsOrganization(
    @Param() vcsOrganizationName: string,
  ): Promise<void> {
    await this.repositoryFacade.collectRepositoriesForVcsOrganization(
      vcsOrganizationName,
    );
  }
}
