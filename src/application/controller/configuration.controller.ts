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
import { GetConfigurationsResponseDTO } from 'src/application/dto/get-configurations.response.dto';
import { ValidateCreateGithubConfigurationParametersDTO } from 'src/application/dto/validate-create-github-configuration-parameters.dto';
import { ValidateCreateGithubConfigurationParametersResponseDTO } from 'src/application/dto/validate-create-github-configuration-parameters.response.dto';

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get('github/validate')
  async validateConfigurationCreationParameters(
    @Body()
    validateCreateGithubConfigurationParametersDTO: ValidateCreateGithubConfigurationParametersDTO,
    @CurrentUser() user: User,
  ): Promise<ValidateCreateGithubConfigurationParametersResponseDTO> {
    const repository = await this.repositoryFacade.getRepositoryById(
      user,
      validateCreateGithubConfigurationParametersDTO.repositoryVcsId,
    );

    if (!repository) {
      return new ValidateCreateGithubConfigurationParametersResponseDTO(
        false,
        `No repository found with id ${validateCreateGithubConfigurationParametersDTO.repositoryVcsId}`,
      );
    }

    const fileExistsOnBranch =
      await this.repositoryFacade.checkFileExistsOnBranch(
        user,
        repository.owner.name,
        repository.name,
        validateCreateGithubConfigurationParametersDTO.configFormatFilePath,
        validateCreateGithubConfigurationParametersDTO.branch,
      );

    if (!fileExistsOnBranch) {
      return new ValidateCreateGithubConfigurationParametersResponseDTO(
        false,
        `No ${validateCreateGithubConfigurationParametersDTO.configFormatFilePath} on branch ${validateCreateGithubConfigurationParametersDTO.branch}`,
      );
    }

    return new ValidateCreateGithubConfigurationParametersResponseDTO(true);
  }

  @Get('github/:vcsRepositoryId/:id')
  async getGitHubConfigurationById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationResponseDTO> {
    const [configuration, hasUserAccessToRepository] = await Promise.all([
      this.configurationFacade.findById(
        VCSProvider.GitHub,
        parseInt(vcsRepositoryId),
        id,
      ),
      this.repositoryFacade.hasAccessToRepository(
        user,
        parseInt(vcsRepositoryId),
      ),
    ]);

    if (!configuration || !hasUserAccessToRepository) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return GetConfigurationResponseDTO.fromDomain(configuration);
  }

  @Get('github/:vcsRepositoryId')
  async getGitHubConfigurationsForRepositoryId(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationsResponseDTO> {
    const hasUserAccessToRepository =
      await this.repositoryFacade.hasAccessToRepository(
        user,
        parseInt(vcsRepositoryId),
      );

    if (!hasUserAccessToRepository) {
      throw new NotFoundException({
        message: `No repository found with id ${vcsRepositoryId}`,
      }); // TODO implement error management
    }

    const configuration = await this.configurationFacade.findAllForRepositoryId(
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
    );

    return GetConfigurationsResponseDTO.fromDomains(configuration);
  }

  @Delete('github/:vcsRepositoryId/:id')
  async deleteGitHubConfigurationById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    const [configuration, hasUserAccessToRepository] = await Promise.all([
      this.configurationFacade.findById(
        VCSProvider.GitHub,
        parseInt(vcsRepositoryId),
        id,
      ),
      this.repositoryFacade.hasAccessToRepository(
        user,
        parseInt(vcsRepositoryId),
      ),
    ]);

    if (!configuration || !hasUserAccessToRepository) {
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
