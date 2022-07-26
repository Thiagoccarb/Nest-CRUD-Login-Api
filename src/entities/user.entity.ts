import {
  Column,
  Model,
  Table,
  AllowNull,
  Unique,
  DataType,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @AllowNull(false)
  @Unique(true)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  hash: string;
}
