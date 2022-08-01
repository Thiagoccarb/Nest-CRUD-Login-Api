import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reminder } from '../entities/reminder.entity';

const newReminder = {
  title: 'teste@email.com',
  description: 'password',
};

const remindersArray = [
  {
    title: 'title1',
    description: 'description1',
  },
  {
    title: 'title2',
    description: 'description2',
  },
];

const reminder = remindersArray[0];

describe('UserService', () => {
  let service: RemindersService;
  let model: typeof Reminder;

  const userId = 1;
  const id = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        RemindersService,
        ConfigService,
        {
          provide: getModelToken(Reminder),
          useValue: {
            create: jest.fn(() => reminder),
            findAll: jest.fn(() => remindersArray),
            findOne: jest.fn(() => reminder),
            update: jest.fn(),
            // findOne: jest.fn(() => user),
            destroy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    model = module.get<typeof Reminder>(getModelToken(Reminder));
  });
  describe('compile', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should successfully insert a user', async () => {
      expect(await service.create(reminder)).toEqual(reminder);
    });
  });

  describe('findAll()', () => {
    const id = 1;
    it('should return an array of reminders', async () => {
      const reminders = await service.findAll(id);
      expect(reminders).toEqual(remindersArray);
    });
  });

  describe('findOne()', () => {
    it('should return one reminder', async () => {
      const reminder = await service.findOne(userId, id);
      expect(reminder).toEqual(reminder);
    });
  });

  describe('update()', () => {
    it('should update a reminder', async () => {
      const spyUpdate = jest.spyOn(model, 'update');
      await service.update(newReminder, userId);
      expect(spyUpdate).toBeCalledWith(
        { ...newReminder },
        { where: { userId } },
      );
    });
  });

  describe('removeReminder()', () => {
    it('should remove an existing reminder', async () => {
      const removeSpy = jest.spyOn(model, 'destroy');
      await service.removeReminder(id, userId);

      expect(removeSpy).toHaveBeenCalledWith({ where: { userId, id } });
    });
  });

  describe('selectReminder()', () => {
    it('should change status key of the selected reminder while switch the rest of reminders status key to false', async () => {
      const spyUpdate = jest.spyOn(model, 'update');
      const spyFindOne = jest.spyOn(service, 'findOne');

      await service.selectReminder(id, userId);
      expect(spyUpdate).toHaveBeenCalledTimes(2);
      expect(spyUpdate).toBeCalledWith(
        { status: false },
        { where: { status: true, userId } },
      );
      expect(spyUpdate).toBeCalledWith(
        { status: true },
        { where: { id, userId } },
      );
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toBeCalledWith(id, userId);
    });
  });
});
