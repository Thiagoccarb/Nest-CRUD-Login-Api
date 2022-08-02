import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';

import { User } from './entities/user.entity';
import { Reminder } from './entities/reminder.entity';
import { UsersModule } from './users/users.module';
import { JwtStrategy } from './jwtStrategy/jwt.strategy';
import { RemindersModule } from './reminders/reminders.module';

dotenv.config();

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345',
      database:
        process.env.NODE_ENV === 'development' ? 'fumico-dev' : 'fumico-test',
      models: [User, Reminder],
      autoLoadModels: true,
      synchronize: true,
    }),
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RemindersModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
