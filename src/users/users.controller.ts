import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import * as argon from 'argon2';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async create(@Body() user: CreateUserDto) {
    try {
      const hash = await argon.hash(user.password);
      const newUser = await this.usersService.create({
        email: user.email,
        hash,
      });

      const displayedUserData = {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.createdAt,
      };

      return displayedUserData;
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ForbiddenException('Credentials taken');
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() user: CreateUserDto) {
    return this.usersService.signIn(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  findAll() {
    return this.usersService.findAll();
  }
}
