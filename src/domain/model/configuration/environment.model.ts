import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';

export default class Environment {
  id: string;
  name: string;
  color: EnvironmentColor;

  constructor(id: string, name: string, color: EnvironmentColor) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}
