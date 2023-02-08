import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import { GetRepositoriesResponseDTO } from 'src/application/dto/repository/get-repositories.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { AuthGuard } from '@nestjs/passport';

@Controller('repositories')
@UseGuards(AuthGuard('jwt'))
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
