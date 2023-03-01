import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import {
  ApiKeyGuard,
  RequestWithEnvironmentId,
} from 'src/application/sdk/authentication/api-key.guard';
import { GetValuesResponseDTO } from 'src/application/sdk/dto/get-values.response.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('values')
@ApiTags('values')
@UseGuards(ApiKeyGuard)
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @Get()
  async getEnvironmentValuesForSdk(
    @Req() { environmentId }: RequestWithEnvironmentId,
  ): Promise<GetValuesResponseDTO> {
    const values = await this.valuesFacade.findByEnvironmentForSdk(
      environmentId,
    );

    return new GetValuesResponseDTO(values);
  }
}
