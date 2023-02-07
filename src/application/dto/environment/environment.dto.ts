import Environment from 'src/domain/model/environment/environment.model';

export default class EnvironmentDTO {
  id: string;
  name: string;
  color: string;
  constructor(id: string, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;
  }

  public static fromDomain(environment: Environment): EnvironmentDTO {
    return new EnvironmentDTO(
      environment.id,
      environment.name,
      environment.color.toString(),
    );
  }
}
