import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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

  @Post('login')
  async signIn(@Body() user: CreateUserDto) {
    return this.usersService.signIn(user);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
