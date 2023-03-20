import { ApiProperty } from '@nestjs/swagger';
import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';
import { ValuesVersionDto } from 'src/application/webapp/dto/values-version/values-version.dto';

export class GetValuesVersionsResponseDto {
  @ApiProperty({ type: [ValuesVersionDto] })
  versions: ValuesVersionDto[];

  static fromDomains(versions: ValuesVersion[]) {
    const dto = new GetValuesVersionsResponseDto();
    dto.versions = versions.map(ValuesVersionDto.fromDomain);
    return dto;
  }
}
