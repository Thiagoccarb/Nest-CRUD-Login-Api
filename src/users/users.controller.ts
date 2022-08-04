import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  // Get,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import * as argon from 'argon2';
import { ApiParam, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiTags('Users')
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'A correct body has been provided',
  })
  @ApiResponse({
    status: 403,
    description: 'An existing email is provided',
  })
  @ApiResponse({
    status: 400,
    description: 'An invalid body is provided',
  })
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

  @ApiTags('Users')
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'A correct login has been provided',
    type: 'string',
  })
  @ApiResponse({
    status: 403,
    description: 'An non existing email is provided',
  })
  @ApiResponse({
    status: 403,
    description: 'An invalid login has been provided',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() user: CreateUserDto) {
    return this.usersService.signIn(user);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Get('users')
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @ApiTags('Users')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'An user status has been successfully updated',
  })
  @ApiResponse({
    status: 406,
    description: 'An invalid id (string)',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @Patch('users/:id')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() user: CreateUserDto,
  ) {
    const hash = await argon.hash(user.password);
    const updatedUserData = {
      email: user.email,
      hash,
      id,
    };
    return this.usersService.update(updatedUserData);
  }

  @ApiTags('Users')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a user that exists in the database',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'An user has been successfully removed',
  })
  @ApiResponse({
    status: 406,
    description: 'A post with invalid id (string),',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @Delete('users/:id')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.usersService.remove(id);
  }
}
