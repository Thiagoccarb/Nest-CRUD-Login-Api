import {
  Column,
  Model,
  Table,
  AllowNull,
  Unique,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Reminder } from './reminder.entity';

@Table
export class User extends Model {
  @AllowNull(false)
  @Unique(true)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  hash: string;

  @HasMany(() => Reminder)
  reminders: Reminder[];
}
