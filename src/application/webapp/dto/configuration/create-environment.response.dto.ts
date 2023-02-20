import { ApiProperty } from '@nestjs/swagger';
import EnvironmentDTO from 'src/application/webapp/dto/environment/environment.dto';
import Environment from 'src/domain/model/environment/environment.model';

export class CreateEnvironmentResponseDTO {
  @ApiProperty()
  environment: EnvironmentDTO;

  static fromDomain(environment: Environment): CreateEnvironmentResponseDTO {
    const dto = new CreateEnvironmentResponseDTO();
    dto.environment = EnvironmentDTO.fromDomain(environment);
    return dto;
  }
}
