import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { UpdateEnvironmentResponseDto } from 'src/application/webapp/dto/configuration/update-environment.response.dto';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { CreateEnvironmentDTO } from 'src/application/webapp/dto/environment/create-environment.dto';
import { CreateEnvironmentResponseDTO } from 'src/application/webapp/dto/configuration/create-environment.response.dto';
import { EnvironmentFacade } from 'src/domain/port/in/environment.facade.port';
import { AuthGuard } from '@nestjs/passport';

@Controller('configurations')
@UseGuards(AuthGuard('jwt'))
export class EnvironmentController {
  constructor(
    @Inject('EnvironmentFacade')
    private readonly configurationFacade: EnvironmentFacade,
  ) {}

  @Patch('github/:vcsRepositoryId/:configurationId/environments/:id')
  async updateEnvironment(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('id') id: string,
    @Body() updateEnvironmentDTO: UpdateEnvironmentDTO,
    @CurrentUser() user: User,
  ): Promise<UpdateEnvironmentResponseDto> {
    const updatedConfiguration =
      await this.configurationFacade.updateEnvironment(
        user,
        VCSProvider.GitHub,
        parseInt(vcsRepositoryId),
        configurationId,
        id,
        updateEnvironmentDTO.name,
        updateEnvironmentDTO.color,
      );
    return UpdateEnvironmentResponseDto.fromDomain(updatedConfiguration);
  }

  @Delete('github/:vcsRepositoryId/:configurationId/environments/:id')
  async deleteEnvironment(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.configurationFacade.deleteEnvironment(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      configurationId,
      id,
    );
  }

  @Post('github/:vcsRepositoryId/:configurationId/environments')
  async createEnvironment(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('configurationId') configurationId: string,
    @Body() createEnvironmentDTO: CreateEnvironmentDTO,
    @CurrentUser() user: User,
  ): Promise<CreateEnvironmentResponseDTO> {
    const updatedConfiguration =
      await this.configurationFacade.createEnvironment(
        user,
        VCSProvider.GitHub,
        parseInt(vcsRepositoryId),
        configurationId,
        createEnvironmentDTO.name,
        createEnvironmentDTO.color,
      );
    return CreateEnvironmentResponseDTO.fromDomain(updatedConfiguration);
  }
}
