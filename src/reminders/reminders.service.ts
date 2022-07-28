import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';

import { Reminder } from 'src/entities/reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder)
    private reminderModel: typeof Reminder,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async create(reminder: Partial<Reminder>) {
    return this.reminderModel.create({ ...reminder });
  }
}
