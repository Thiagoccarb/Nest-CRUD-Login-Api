import {
  Column,
  Model,
  Table,
  AllowNull,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table
export class Reminder extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  status: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
