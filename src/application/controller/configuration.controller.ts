import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateGitHubConfigurationDTO } from 'src/application/dto/create-github-configuration.dto';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetConfigurationResponseDTO } from 'src/application/dto/get-configuration.response.dto';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { GetConfigurationsResponseDTO } from 'src/application/dto/get-configurations.response.dto';
import { ValidateCreateGithubConfigurationParametersDTO } from 'src/application/dto/validate-create-github-configuration-parameters.dto';
import { ValidateCreateGithubConfigurationParametersResponseDTO } from 'src/application/dto/validate-create-github-configuration-parameters.response.dto';
import { CreateGitHubConfigurationResponseDTO } from 'src/application/dto/create-github-configuration.response.dto';
import { GetConfigurationFormatResponseDTO } from 'src/application/dto/get-configuration-format.response.dto';

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
  ) {}

  @Post('github/validate')
  @HttpCode(200)
  async validateConfigurationCreationParameters(
    @Body()
    validateCreateGithubConfigurationParametersDTO: ValidateCreateGithubConfigurationParametersDTO,
    @CurrentUser() user: User,
  ): Promise<ValidateCreateGithubConfigurationParametersResponseDTO> {
    return await this.configurationFacade.validateCreateForUser(
      user,
      validateCreateGithubConfigurationParametersDTO.repositoryVcsId,
      validateCreateGithubConfigurationParametersDTO.configFormatFilePath,
      validateCreateGithubConfigurationParametersDTO.branch,
    );
  }

  @Get('github/:vcsRepositoryId/:id')
  async getGitHubConfigurationById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );

    return GetConfigurationResponseDTO.fromDomain(configuration);
  }

  @Get('github/:vcsRepositoryId/:id/format')
  async getGitHubConfigurationFormatById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationFormatResponseDTO> {
    const format = await this.configurationFacade.findFormatByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );

    return new GetConfigurationFormatResponseDTO(format);
  }

  @Get('github/:vcsRepositoryId')
  async getGitHubConfigurationsForRepositoryId(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationsResponseDTO> {
    const configuration =
      await this.configurationFacade.findAllForRepositoryIdForUser(
        user,
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
    await this.configurationFacade.deleteByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );
  }

  @Post('github')
  async createForGitHub(
    @Body() createConfigurationDTO: CreateGitHubConfigurationDTO,
    @CurrentUser() user: User,
  ): Promise<CreateGitHubConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.createForUser(
      user,
      createConfigurationDTO.name,
      createConfigurationDTO.repositoryVcsId,
      createConfigurationDTO.configFormatFilePath,
      createConfigurationDTO.branch,
    );

    return CreateGitHubConfigurationResponseDTO.fromDomain(configuration);
  }
}
