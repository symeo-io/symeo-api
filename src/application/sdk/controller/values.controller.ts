import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ValuesFacade } from 'src/domain/port/in/values.facade';
import {
  ApiKeyGuard,
  RequestWithEnvironmentId,
} from 'src/application/sdk/authentication/api-key.guard';
import { GetValuesResponseDTO } from 'src/application/sdk/dto/get-values.response.dto';

@Controller('values')
@UseGuards(ApiKeyGuard)
export class ValuesController {
  constructor(
    @Inject('ValuesFacade')
    private readonly valuesFacade: ValuesFacade,
  ) {}

  @Get()
  async getEnvironmentValues(
    @Req() { environmentId }: RequestWithEnvironmentId,
  ): Promise<GetValuesResponseDTO> {
    const values = await this.valuesFacade.findByEnvironmentId(environmentId);

    return new GetValuesResponseDTO(values);
  }
}
