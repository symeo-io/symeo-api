import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommitToRepositoryDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fileContent: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filePath: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  commitMessage: string;
}
