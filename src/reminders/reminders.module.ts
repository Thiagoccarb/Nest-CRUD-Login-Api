import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder } from 'src/entities/reminder.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Reminder]), JwtModule.register({})],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
