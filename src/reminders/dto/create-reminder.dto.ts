import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({
    minLength: 3,
    type: 'string',
    required: true,
  })
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    minLength: 10,
    type: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  readonly description: string;
}
