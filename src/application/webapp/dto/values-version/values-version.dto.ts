import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';
import { ApiProperty } from '@nestjs/swagger';

export class ValuesVersionDto {
  @ApiProperty()
  versionId: string;
  @ApiProperty()
  creationDate: Date;

  constructor(versionId: string, creationDate: Date) {
    this.versionId = versionId;
    this.creationDate = creationDate;
  }

  static fromDomain(valuesVersion: ValuesVersion): ValuesVersionDto {
    return new ValuesVersionDto(
      valuesVersion.versionId,
      valuesVersion.creationDate,
    );
  }
}
