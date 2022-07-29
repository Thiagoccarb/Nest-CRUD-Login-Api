import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'invalid e-mail format' })
  readonly email: string;
}
