import {
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

@Controller('configurations')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ConfigurationDTO | null> {
    const configuration = await this.configurationFacade.findById(id);

    if (!configuration) {
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return ConfigurationDTO.fromDomain(configuration);
  }

  @Post()
  async create(): Promise<ConfigurationDTO> {
    const configuration = new Configuration(uuid(), 'test');

    await this.configurationFacade.save(configuration);

    return ConfigurationDTO.fromDomain(configuration);
  }
}
