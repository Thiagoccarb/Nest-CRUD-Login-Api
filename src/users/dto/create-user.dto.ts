import { IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @Min(3)
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly hash: string;
}
