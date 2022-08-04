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
import { ApiParam, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

import { GetUser } from '../decorators/getUserData.decorator';
import { User } from '../entities/user.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { RemindersService } from './reminders.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @ApiTags('Reminders')
  @ApiBody({
    type: CreateReminderDto,
  })
  @ApiResponse({
    status: 201,
    description: 'A correct body has been provided',
  })
  @ApiResponse({
    status: 400,
    description: 'An invalid body is provided',
  })
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

  @ApiTags('Reminders')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a reminder that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'A reminder has been successfully updated',
  })
  @ApiResponse({
    status: 406,
    description: 'An invalid id (string)',
  })
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

  @ApiTags('Reminders')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a reminder that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'An object typeof Reminder',
    type: CreateReminderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'An invalid id (non existing reminder)',
  })
  @ApiResponse({
    status: 406,
    description: 'An invalid id (string)',
  })
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

  @ApiTags('Reminders')
  @ApiResponse({
    status: 200,
    description: 'An array of reminders object',
  })
  @ApiResponse({
    status: 404,
    description: 'No reminder registered yet with the userId',
  })
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

  @ApiTags('Reminders')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a reminder that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'An reminder has been successfully removed',
  })
  @ApiResponse({
    status: 406,
    description: 'An invalid id (string),',
  })
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

  @ApiTags('Reminders')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a reminder that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'An reminder has been successfully updated',
  })
  @ApiResponse({
    status: 406,
    description: 'An invalid id (string)',
  })
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
