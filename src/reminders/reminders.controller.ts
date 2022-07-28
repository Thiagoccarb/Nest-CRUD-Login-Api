import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUserData.decorator';
import { User } from 'src/entities/user.entity';
import { CreateReminderDto } from './dto/create-reminder';
import { RemindersService } from './reminders.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  async create(@Body() reminder: CreateReminderDto, @GetUser() user: User) {
    const { title, description } = reminder;
    const id = user.id;
    const newReminder = await this.remindersService.create({
      title,
      description,
      status: false,
      userId: id,
    });

    const displayedReminderData = {
      id: newReminder.id,
      description: newReminder.description,
      created_at: newReminder.createdAt,
    };

    return displayedReminderData;
  }
}
