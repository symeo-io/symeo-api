import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import ConfigurationDTO from 'src/application/dto/configuration.dto';
import Configuration from 'src/domain/model/configuration.model';
import { v4 as uuid } from 'uuid';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateConfigurationDTO } from 'src/application/dto/create-configuration.dto';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
    @Inject('VCSAccessTokenAdapter')
    private readonly vcsAccessTokenStorage: VCSAccessTokenStorage,
  ) {}

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ConfigurationDTO | null> {
    console.log('toto');
    const token = await this.vcsAccessTokenStorage.getGitHubAccessToken(
      user.id,
    );
    console.log('token', token);

    const configuration = await this.configurationFacade.findById(id);

    if (!configuration) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return ConfigurationDTO.fromDomain(configuration);
  }

  @Post()
  async create(
    @Body() createConfigurationDTO: CreateConfigurationDTO,
  ): Promise<ConfigurationDTO> {
    const configuration = new Configuration(
      uuid(),
      createConfigurationDTO.repositoryId,
    );

    await this.configurationFacade.save(configuration);

    return ConfigurationDTO.fromDomain(configuration);
  }
}
