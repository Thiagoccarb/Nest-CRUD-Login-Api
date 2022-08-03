import { CreateReminderDto } from './create-reminder.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReminderDto extends CreateReminderDto {
  @ApiProperty({
    type: 'number',
    description: 'the id is required when updating a reminder',
  })
  readonly id: number;
}
