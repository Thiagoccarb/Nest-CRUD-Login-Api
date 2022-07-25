import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AllowNull,
  Unique,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  @PrimaryKey
  id: string;

  @Column
  @AllowNull(false)
  @Unique(false)
  email: string;

  @Column
  @AllowNull(false)
  hash: string;
}
