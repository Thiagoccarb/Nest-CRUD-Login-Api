import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateReminderDto {
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  readonly description: string;
}
