import { Controller, Get, Inject } from '@nestjs/common';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import { GetRepositoriesResponseDTO } from 'src/application/dto/get-repositories.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';

@Controller('repositories')
export class RepositoryController {
  constructor(
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get()
  async getRepositories(
    @CurrentUser() user: User,
  ): Promise<GetRepositoriesResponseDTO> {
    return GetRepositoriesResponseDTO.fromDomains(
      await this.repositoryFacade.getRepositories(user),
    );
  }
}