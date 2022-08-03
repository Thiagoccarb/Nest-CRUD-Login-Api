import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    minLength: 6,
    type: 'string',
    required: true,
  })
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    type: 'string',
    required: true,
    description: 'must match regex ^[a-z0-9.]+@[a-z0-9]+.[a-z]+.*?[a-z]+',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'invalid e-mail format' })
  readonly email: string;
}
