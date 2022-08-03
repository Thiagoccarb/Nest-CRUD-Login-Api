import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    type: 'number',
    required: true,
  })
  id: number;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  hash?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  email: string;
}
