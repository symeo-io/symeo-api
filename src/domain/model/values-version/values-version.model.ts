export class ValuesVersion {
  constructor(versionId: string, creationDate: Date) {
    this.versionId = versionId;
    this.creationDate = creationDate;
  }

  versionId: string;
  creationDate: Date;
}
