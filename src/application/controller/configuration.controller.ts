import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import ConfigurationDTO from 'src/application/dto/configuration.dto';
import Configuration from 'src/domain/model/configuration.model';
import { v4 as uuid } from 'uuid';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';

@Controller('configuration')
export class ConfigurationController {
  constructor(
    @Inject('ConfigurationFacade')
    private readonly configurationFacade: ConfigurationFacade,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ConfigurationDTO | null> {
    const configuration = await this.configurationFacade.findById(id);

    if (!configuration) {
      throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
    }

    return ConfigurationDTO.fromDomain(configuration);
  }

  @Post()
  async create(): Promise<ConfigurationDTO> {
    const configuration = new Configuration(uuid());

    await this.configurationFacade.save(configuration);

    return ConfigurationDTO.fromDomain(configuration);
  }
}
