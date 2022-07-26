import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AllowNull,
  Unique,
  DataType,
  AutoIncrement,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.STRING)
  id: string;

  @AllowNull(false)
  @Unique(true)
  @Column(DataType.STRING)
  usrname: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  hash: string;
}
