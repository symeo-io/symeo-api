import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';

export default class Environment {
  id: string;
  name: string;
  color: EnvironmentColor;
  createdAt: Date;

  constructor(
    id: string,
    name: string,
    color: EnvironmentColor,
    createdAt?: Date,
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.createdAt = createdAt ?? new Date();
  }
}
