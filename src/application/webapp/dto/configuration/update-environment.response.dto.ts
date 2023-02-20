import { ApiProperty } from '@nestjs/swagger';
import EnvironmentDTO from 'src/application/webapp/dto/environment/environment.dto';
import Environment from 'src/domain/model/environment/environment.model';

export class UpdateEnvironmentResponseDTO {
  @ApiProperty()
  environment: EnvironmentDTO;

  static fromDomain(environment: Environment): UpdateEnvironmentResponseDTO {
    const dto = new UpdateEnvironmentResponseDTO();
    dto.environment = EnvironmentDTO.fromDomain(environment);
    return dto;
  }
}
