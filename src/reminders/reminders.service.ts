import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Reminder } from 'src/entities/reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder)
    private reminderModel: typeof Reminder,
  ) {}

  async create(reminder: Partial<Reminder>) {
    return this.reminderModel.create({ ...reminder });
  }

  async findOne(id: number) {
    return this.reminderModel.findOne({ where: { id }, raw: true });
  }

  async selectReminder(id: number) {
    await this.reminderModel.update(
      { status: false },
      { where: { status: true } },
    );
    await this.reminderModel.update({ status: true }, { where: { id } });
    return this.findOne(id);
  }
}
