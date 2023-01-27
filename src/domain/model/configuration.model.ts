export default class Configuration {
  id: string;
  repositoryId: string;

  constructor(id: string, repositoryId: string) {
    this.id = id;
    this.repositoryId = repositoryId;
  }
}
