import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import User from 'src/domain/model/user.model';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetRepositoriesResponseDTO } from 'src/application/webapp/dto/repository/get-repositories.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetOrganizationsResponseDTO } from 'src/application/webapp/dto/organization/get-organizations.response.dto';

@Controller('repositories')
@ApiTags('repositories')
@UseGuards(AuthGuard('jwt'))
export class RepositoryController {
  constructor(
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Repositories successfully retrieved',
    type: GetRepositoriesResponseDTO,
  })
  async getRepositories(
    @CurrentUser() user: User,
  ): Promise<GetRepositoriesResponseDTO> {
    return GetRepositoriesResponseDTO.fromDomains(
      await this.repositoryFacade.getRepositories(user),
    );
  }
}
