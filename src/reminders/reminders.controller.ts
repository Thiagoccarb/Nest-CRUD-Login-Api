import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorators/getUserData.decorator';
import { User } from '../entities/user.entity';
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
      title: newReminder.title,
      userId: newReminder.userId,
      description: newReminder.description,
      created_at: newReminder.createdAt,
    };

    return displayedReminderData;
  }

  @Patch(':id')
  async selectReminder(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetUser() user: User,
  ) {
    return this.remindersService.selectReminder(id, user.id);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetUser() user: User,
  ) {
    const existingUser = await this.remindersService.findOne(id, user.id);
    if (!existingUser) {
      throw new NotFoundException('user not found');
    }
    return existingUser;
  }

  @Get()
  async findAll(@GetUser() user: User) {
    const reminders = await this.remindersService.findAll(user.id);
    if (!reminders.length) {
      throw new NotFoundException(
        'sorry, no data found related to the requested user',
      );
    }
    return reminders;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async removeReminder(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetUser() user: User,
  ) {
    return this.remindersService.removeReminder(id, user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetUser() user: User,
    @Body() reminder: CreateReminderDto,
  ) {
    const userId = user.id;
    await this.remindersService.update(reminder, userId);
  }
}
