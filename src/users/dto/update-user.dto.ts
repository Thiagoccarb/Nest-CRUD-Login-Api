import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  hash?: string;
  @ApiProperty()
  email: string;
}
