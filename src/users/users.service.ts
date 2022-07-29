import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as argon from 'argon2';

import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Constants } from 'src/enums/constant';
import { UserWithID } from './dto/user-dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async create(user: Partial<User>) {
    return this.userModel.create({ ...user });
  }

  async signIn(user: CreateUserDto) {
    const existingUser = (await this.userModel.findOne({
      where: { email: user.email },
      raw: true,
    })) as UserWithID | null;
    const passwordMatches = await argon.verify(
      existingUser?.hash || '',
      user.password,
    );

    if (!existingUser || !passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }
    return this.signToken(existingUser?.id, existingUser.email);
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const token = this.jwt.sign(payload, {
      expiresIn: '1h',
      secret: this.config.get(Constants.jwtSecret),
    });
    return { token };
  }

  async findAll() {
    return this.userModel.findAll({ raw: true });
  }

  async update(user: UpdateUserDto) {
    try {
      const id = user.id;
      await this.userModel.update({ ...user }, { where: { id } });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ForbiddenException('Credentials taken');
      }
    }
  }
}
