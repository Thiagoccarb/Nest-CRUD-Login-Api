import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Patch(':id')
  async selectReminder(@Param('id') id: string, @GetUser() user: User) {
    return this.remindersService.selectReminder(Number(id), Number(user.id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    const existingUser = await this.remindersService.findOne(
      Number(id),
      Number(user.id),
    );
    if (!existingUser) {
      throw new NotFoundException('user not found');
    }
    return existingUser;
  }

  @Get()
  async findAll(@GetUser() user: User) {
    const reminders = await this.remindersService.findAll(Number(user.id));
    if (!reminders.length) {
      throw new NotFoundException(
        'sorry, no data found related to the requested user',
      );
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async removeReminder(@Param('id') id: string, @GetUser() user: User) {
    return this.remindersService.removeReminder(Number(id), Number(user.id));
  }
}
