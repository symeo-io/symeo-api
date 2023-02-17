import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateGitHubConfigurationDTO } from 'src/application/webapp/dto/configuration/create-github-configuration.dto';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/get-configuration.response.dto';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { GetConfigurationsResponseDTO } from 'src/application/webapp/dto/configuration/get-configurations.response.dto';
import { ValidateCreateGithubConfigurationParametersDTO } from 'src/application/webapp/dto/configuration/validate-create-github-configuration-parameters.dto';
import { ValidateCreateGithubConfigurationParametersResponseDTO } from 'src/application/webapp/dto/configuration/validate-create-github-configuration-parameters.response.dto';
import { CreateGitHubConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/create-github-configuration.response.dto';
import { GetConfigurationContractResponseDTO } from 'src/application/webapp/dto/contract/get-configuration-contract.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('configurations')
@ApiTags('configurations')
@UseGuards(AuthGuard('jwt'))
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
  ) {}

  @ApiOkResponse({
    description: 'Creation of Github configuration parameters validated',
    type: ValidateCreateGithubConfigurationParametersResponseDTO,
  })
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
      validateCreateGithubConfigurationParametersDTO.contractFilePath,
      validateCreateGithubConfigurationParametersDTO.branch,
    );
  }

  @ApiOkResponse({
    description: 'Github configuration successfully retrieved',
    type: GetConfigurationResponseDTO,
  })
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

  @ApiOkResponse({
    description: 'Github configuration contract successfully retrieved',
    type: GetConfigurationContractResponseDTO,
  })
  @Get('github/:vcsRepositoryId/:id/contract')
  async getGitHubConfigurationContractById(
    @Param('vcsRepositoryId') vcsRepositoryId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationContractResponseDTO> {
    const contract = await this.configurationFacade.findContractByIdForUser(
      user,
      VCSProvider.GitHub,
      parseInt(vcsRepositoryId),
      id,
    );

    return new GetConfigurationContractResponseDTO(contract);
  }

  @Get('github/:vcsRepositoryId')
  @ApiOkResponse({
    description:
      'Github configurations for repositoryId successfully retrieved',
    type: GetConfigurationsResponseDTO,
  })
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

  @ApiOkResponse({
    description: 'Github configuration successfully deleted',
  })
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

  @ApiOkResponse({
    description: 'Github configuration successfully created',
    type: CreateGitHubConfigurationResponseDTO,
  })
  @Post('github')
  async createForGitHub(
    @Body() createConfigurationDTO: CreateGitHubConfigurationDTO,
    @CurrentUser() user: User,
  ): Promise<CreateGitHubConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.createForUser(
      user,
      createConfigurationDTO.name,
      createConfigurationDTO.repositoryVcsId,
      createConfigurationDTO.contractFilePath,
      createConfigurationDTO.branch,
    );

    return CreateGitHubConfigurationResponseDTO.fromDomain(configuration);
  }
}
