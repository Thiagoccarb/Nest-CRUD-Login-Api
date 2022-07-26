import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as argon from 'argon2';

import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(user: Partial<User>) {
    return this.userModel.create({ ...user });
  }

  async signIn(user: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: user.email },
      raw: true,
    });
    const passwordMatches = await argon.verify(
      existingUser?.hash || '',
      user.password,
    );

    if (!existingUser || !passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }
    return existingUser;
  }
}
