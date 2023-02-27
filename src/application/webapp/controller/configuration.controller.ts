import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateGitHubConfigurationDTO } from 'src/application/webapp/dto/configuration/create-github-configuration.dto';
import { CurrentUser } from 'src/application/webapp/decorator/current-user.decorator';
import User from 'src/domain/model/user/user.model';
import { GetConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/get-configuration.response.dto';
import { GetConfigurationsResponseDTO } from 'src/application/webapp/dto/configuration/get-configurations.response.dto';
import { ValidateCreateGithubConfigurationParametersDTO } from 'src/application/webapp/dto/configuration/validate-create-github-configuration-parameters.dto';
import { ValidateCreateGithubConfigurationParametersResponseDTO } from 'src/application/webapp/dto/configuration/validate-create-github-configuration-parameters.response.dto';
import { CreateGitHubConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/create-github-configuration.response.dto';
import { GetConfigurationContractResponseDTO } from 'src/application/webapp/dto/contract/get-configuration-contract.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateGitHubConfigurationDTO } from 'src/application/webapp/dto/configuration/update-github-configuration.dto';
import { UpdateGitHubConfigurationResponseDTO } from 'src/application/webapp/dto/configuration/update-github-configuration.response.dto';
import { ConfigurationAuthorizationGuard } from 'src/application/webapp/authorization/ConfigurationAuthorizationGuard';
import { RequestedConfiguration } from 'src/application/webapp/decorator/requested-configuration.decorator';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { RepositoryAuthorizationGuard } from 'src/application/webapp/authorization/RepositoryAuthorizationGuard';
import { RequestedRepository } from 'src/application/webapp/decorator/requested-repository.decorator';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { MinimumPermissionRoleRequired } from 'src/application/webapp/decorator/environment-permission-role.decorator';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

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
  @Get('github/:repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  async getGitHubConfigurationById(
    @RequestedConfiguration() configuration: Configuration,
  ): Promise<GetConfigurationResponseDTO> {
    return GetConfigurationResponseDTO.fromDomain(configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration contract successfully retrieved',
    type: GetConfigurationContractResponseDTO,
  })
  @Get('github/:repositoryVcsId/:configurationId/contract')
  @UseGuards(ConfigurationAuthorizationGuard)
  async getGitHubConfigurationContractById(
    @RequestedConfiguration() configuration: Configuration,
    @Query('branch') branch: string | undefined,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationContractResponseDTO> {
    const contract = await this.configurationFacade.findContract(
      user,
      configuration,
      branch,
    );

    return new GetConfigurationContractResponseDTO(contract);
  }

  @ApiOkResponse({
    description:
      'Github configurations for repositoryId successfully retrieved',
    type: GetConfigurationsResponseDTO,
  })
  @Get('github/:repositoryVcsId')
  @UseGuards(RepositoryAuthorizationGuard)
  async getGitHubConfigurationsForRepositoryId(
    @RequestedRepository() repository: VcsRepository,
  ): Promise<GetConfigurationsResponseDTO> {
    const configuration = await this.configurationFacade.findAllForRepository(
      repository,
    );

    return GetConfigurationsResponseDTO.fromDomains(configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration successfully deleted',
  })
  @Delete('github/:repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  async deleteGitHubConfigurationById(
    @RequestedConfiguration() configuration: Configuration,
  ): Promise<void> {
    await this.configurationFacade.delete(configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration successfully created',
    type: CreateGitHubConfigurationResponseDTO,
  })
  @Post('github/:repositoryVcsId')
  @UseGuards(RepositoryAuthorizationGuard)
  @MinimumPermissionRoleRequired(EnvironmentPermissionRole.ADMIN)
  async createForGitHub(
    @RequestedRepository() repository: VcsRepository,
    @CurrentUser() user: User,
    @Body() createConfigurationDTO: CreateGitHubConfigurationDTO,
  ): Promise<CreateGitHubConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.createForRepository(
      user,
      repository,
      createConfigurationDTO.name,
      createConfigurationDTO.contractFilePath,
      createConfigurationDTO.branch,
    );

    return CreateGitHubConfigurationResponseDTO.fromDomain(configuration);
  }

  @ApiOkResponse({
    description: 'Github configuration successfully updated',
    type: UpdateGitHubConfigurationResponseDTO,
  })
  @Patch('github/:repositoryVcsId/:configurationId')
  @UseGuards(ConfigurationAuthorizationGuard)
  async updateForGitHub(
    @RequestedConfiguration() configuration: Configuration,
    @Body() updateConfigurationDTO: UpdateGitHubConfigurationDTO,
  ): Promise<UpdateGitHubConfigurationResponseDTO> {
    const updatedConfiguration = await this.configurationFacade.update(
      configuration,
      updateConfigurationDTO.name,
      updateConfigurationDTO.contractFilePath,
      updateConfigurationDTO.branch,
    );

    return UpdateGitHubConfigurationResponseDTO.fromDomain(
      updatedConfiguration,
    );
  }
}
