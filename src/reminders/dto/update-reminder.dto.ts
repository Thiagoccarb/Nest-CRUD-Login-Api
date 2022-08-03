import { CreateReminderDto } from './create-reminder.dto';

export class UpdateReminderDto extends CreateReminderDto {
  readonly id: number;
}
