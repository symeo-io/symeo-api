import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import User from 'src/domain/model/user/user.model';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import { GetRepositoriesResponseDTO } from 'src/application/webapp/dto/repository/get-repositories.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetRepositoryBranchesResponseDTO } from 'src/application/webapp/dto/repository/get-repository-branches.response.dto';

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

  @Get(':vcsRepositoryId/branches')
  @ApiOkResponse({
    description: 'Repository branches successfully retrieved',
    type: GetRepositoryBranchesResponseDTO,
  })
  async getRepositoryBranches(
    @CurrentUser() user: User,
    @Param('vcsRepositoryId') vcsRepositoryId: string,
  ): Promise<GetRepositoryBranchesResponseDTO> {
    return GetRepositoryBranchesResponseDTO.fromDomains(
      await this.repositoryFacade.getBranchByRepositoryId(
        user,
        parseInt(vcsRepositoryId),
      ),
    );
  }
}
