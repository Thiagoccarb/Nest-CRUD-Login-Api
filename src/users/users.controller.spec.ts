import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { AuthGuard } from '@nestjs/passport';
import * as argon from 'argon2';

const hash = 'hash';

const newUser = {
  email: 'teste@email.com',
  password: 'password',
  created_at: undefined,
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

const mockedToken = 'token';

describe('UsersController', () => {
  let service: UsersService;
  let controller: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        AuthGuard('jwt'),
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockImplementation((user: CreateUserDto) =>
              Promise.resolve({
                id: 1,
                email: user.email,
              }),
            ),
            findAll: jest.fn(() => usersArray),
            signIn: jest.fn(() => mockedToken),

            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = app.get<UsersService>(UsersService);
    controller = app.get<UsersController>(UsersController);
  });
  describe('compile', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should successfully insert a user', async () => {
      jest.spyOn(argon, 'hash').mockResolvedValue(hash);
      expect(await controller.create(newUser)).toEqual({
        id: 1,
        email: newUser.email,
        created_at: newUser.created_at,
      });
      expect(service.create).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalledWith({
        email: newUser.email,
        hash,
      });
    });
  });

  // describe('findAll()', () => {
  //   it('should return an array of users', async () => {
  //     const users = await controller.findAll();
  //     expect(users).toEqual(usersArray);
  //   });
  // });

  describe('signIn()', () => {
    it('should return a token', async () => {
      const token = await controller.signIn(newUser);
      expect(token).toEqual(mockedToken);
    });
  });

  describe('update()', () => {
    const id = 1;
    it('should return update a specific user', async () => {
      jest.spyOn(argon, 'hash').mockResolvedValue(hash);
      await controller.update(id, newUser);
      expect(service.update).toHaveBeenCalledWith({
        email: newUser.email,
        hash,
        id,
      });
    });
  });

  describe('remove()', () => {
    it('should remove an existing user', async () => {
      const id = 1;
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
