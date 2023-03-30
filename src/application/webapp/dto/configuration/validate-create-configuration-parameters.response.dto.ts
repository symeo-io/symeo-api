import { ApiProperty } from '@nestjs/swagger';

export class ValidateCreateConfigurationParametersResponseDTO {
  @ApiProperty()
  isValid: boolean;
  @ApiProperty()
  message?: string;

  constructor(isValid: boolean, message?: string) {
    this.isValid = isValid;
    this.message = message;
  }
}
