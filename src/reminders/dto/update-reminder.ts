import { CreateReminderDto } from './create-reminder';

export class UpdateReminderDto extends CreateReminderDto {
  readonly id: number;
}
