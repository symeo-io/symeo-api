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
import Configuration from 'src/domain/model/configuration/configuration.model';
import { v4 as uuid } from 'uuid';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { CreateConfigurationDTO } from 'src/application/dto/create-configuration.dto';
import { CurrentUser } from 'src/application/decorator/current-user.decorator';
import User from 'src/domain/model/user.model';
import { GetConfigurationResponseDTO } from 'src/application/dto/get-configuration.response.dto';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
    @Inject('RepositoryFacade')
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GetConfigurationResponseDTO> {
    const configuration = await this.configurationFacade.findById(id);

    if (!configuration) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    const hasUserAccessToConfigurationRepository =
      this.repositoryFacade.hasAccessToRepository(
        user,
        configuration.repository.vcsId,
      );

    if (!hasUserAccessToConfigurationRepository) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return GetConfigurationResponseDTO.fromDomain(configuration);
  }

  @Post()
  async create(
    @Body() createConfigurationDTO: CreateConfigurationDTO,
  ): Promise<ConfigurationDTO> {
    const configuration = new Configuration(
      uuid(),
      createConfigurationDTO.name,
      createConfigurationDTO.vcsType,
      {
        name: createConfigurationDTO.repositoryName,
        vcsId: createConfigurationDTO.repositoryVcsId,
      },
      {
        name: createConfigurationDTO.ownerName,
        vcsId: createConfigurationDTO.ownerVcsId,
      },
      createConfigurationDTO.configFormatFilePath,
      createConfigurationDTO.branch,
    );

    await this.configurationFacade.save(configuration);

    return ConfigurationDTO.fromDomain(configuration);
  }
}
