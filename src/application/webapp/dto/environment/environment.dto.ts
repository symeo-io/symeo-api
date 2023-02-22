import Environment from 'src/domain/model/environment/environment.model';
import { ApiProperty } from '@nestjs/swagger';

export default class EnvironmentDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  color: string;
  @ApiProperty()
  createdAt: string;
  constructor(id: string, name: string, color: string, createdAt: string) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.createdAt = createdAt;
  }

  public static fromDomain(environment: Environment): EnvironmentDTO {
    return new EnvironmentDTO(
      environment.id,
      environment.name,
      environment.color.toString(),
      environment.createdAt.toISOString(),
    );
  }
}
