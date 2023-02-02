import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import ConfigurationDTO from 'src/application/dto/configuration.dto';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { v4 as uuid } from 'uuid';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateGitHubConfigurationDTO } from 'src/application/dto/create-github-configuration.dto';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetConfigurationResponseDTO } from 'src/application/dto/get-configuration.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get('github/:vcsRepositoryId/:id')
  async getGitHubConfigurationById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.findById(
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );
    const hasUserAccessToConfigurationRepository =
      await this.repositoryFacade.hasAccessToRepository(
        user,
        parseInt(vcsRepositoryId),
      );

    if (!configuration || !hasUserAccessToConfigurationRepository) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return GetConfigurationResponseDTO.fromDomain(configuration);
  }

  @Delete('github/:vcsRepositoryId/:id')
  async deleteGitHubConfigurationById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    const configuration = await this.configurationFacade.findById(
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );
    const hasUserAccessToConfigurationRepository =
      await this.repositoryFacade.hasAccessToRepository(
        user,
        parseInt(vcsRepositoryId),
      );

    if (!configuration || !hasUserAccessToConfigurationRepository) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    await this.configurationFacade.delete(configuration);
  }

  @Post('github')
  async createForGitHub(
    @Body() createConfigurationDTO: CreateGitHubConfigurationDTO,
    @CurrentUser() user: User,
  ): Promise<ConfigurationDTO> {
    const repository = await this.repositoryFacade.getRepositoryById(
      user,
      createConfigurationDTO.repositoryVcsId,
    );

    if (!repository) {
      throw new BadRequestException({
        message: `No repository found with id ${createConfigurationDTO.repositoryVcsId}`,
      }); // TODO implement error management
    }

    const configuration = new Configuration(
      uuid(),
      createConfigurationDTO.name,
      VCSProvider.GitHub,
      {
        name: repository.name,
        vcsId: repository.id,
      },
      {
        name: repository.owner.name,
        vcsId: repository.owner.id,
      },
      createConfigurationDTO.configFormatFilePath,
      createConfigurationDTO.branch,
    );

    await this.configurationFacade.save(configuration);

    return ConfigurationDTO.fromDomain(configuration);
  }
}
