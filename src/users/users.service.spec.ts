import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

const newUser = {
  email: 'teste@email.com',
  password: 'password',
};

const usersArray = [
  {
    email: 'teste@email.com',
    hash: 'created-hash',
  },
  {
    email: 'teste2@email.com',
    hash: 'created-hash',
  },
];

const user = usersArray[0];

const updatedUser = {
  id: 1,
  email: 'teste-update@email.com',
  hash: 'created-hash',
};

const mockedToken = 'token';

describe('UserService', () => {
  let service: UsersService;
  let model: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        UsersService,
        ConfigService,
        {
          provide: getModelToken(User),
          useValue: {
            findAll: jest.fn(() => usersArray),
            create: jest.fn(() => user),
            update: jest.fn(),
            findOne: jest.fn(() => user),
            destroy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<typeof User>(getModelToken(User));
  });
  describe('compile', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should successfully insert a user', async () => {
      expect(await service.create(user)).toEqual(user);
    });
  });

  // describe('findAll()', () => {
  //   it('should return an array of users', async () => {
  //     const users = await service.findAll();
  //     expect(users).toEqual(usersArray);
  //   });
  // });

  describe('signIn()', () => {
    it('should return a token', async () => {
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      const signTokenSpy = jest
        .spyOn(service, 'signToken')
        .mockResolvedValue({ token: mockedToken });
      const findSpy = jest.spyOn(model, 'findOne');
      const { token } = await service.signIn(newUser);
      expect(service.signIn(newUser));
      expect(signTokenSpy).toHaveBeenCalled();
      expect(findSpy).toBeCalledWith({
        where: { email: newUser.email },
        raw: true,
      });
      expect(token).toEqual(mockedToken);
    });
  });

  describe('update()', () => {
    it('should return update a specific user', async () => {
      const updateSpy = jest.spyOn(model, 'update');
      await service.update(updatedUser);

      expect(updateSpy).toHaveBeenCalledWith(
        { ...updatedUser },
        { where: { id: updatedUser.id } },
      );
    });
  });

  describe('remove()', () => {
    it('should remove an existing user', async () => {
      const id = 1;
      const removeSpy = jest.spyOn(model, 'destroy');
      await service.remove(id);

      expect(removeSpy).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
