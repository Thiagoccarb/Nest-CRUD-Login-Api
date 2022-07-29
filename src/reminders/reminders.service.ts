import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Reminder } from 'src/entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder)
    private reminderModel: typeof Reminder,
  ) {}

  async create(reminder: Partial<Reminder>) {
    return this.reminderModel.create({ ...reminder });
  }

  async findOne(id: number, userId: number) {
    return this.reminderModel.findOne({ where: { id, userId }, raw: true });
  }

  async findAll(userId: number) {
    return this.reminderModel.findAll({ where: { userId }, raw: true });
  }

  async update(reminder: CreateReminderDto, userId: number) {
    return this.reminderModel.update({ ...reminder }, { where: { userId } });
  }

  async selectReminder(id: number, userId: number) {
    await this.reminderModel.update(
      { status: false },
      { where: { status: true, userId } },
    );
    await this.reminderModel.update(
      { status: true },
      { where: { id, userId } },
    );
    return this.findOne(id, userId);
  }

  async removeReminder(id: number, userId: number) {
    return this.reminderModel.destroy({ where: { userId, id } });
  }
}
