import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { AuthGuard } from '@nestjs/passport';

const newReminder = {
  title: 'title',
  description: 'description',
  id: 1,
  created_at: undefined,
  userId: 1,
};

const userData = { email: '', hash: '', id: 1, reminders: [] };

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

describe('RemindersController', () => {
  let service: RemindersService;
  let controller: RemindersController;

  const id = 1;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [
        AuthGuard('jwt'),
        {
          provide: RemindersService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation(() => Promise.resolve(newReminder)),
            findAll: jest.fn(() => remindersArray),
            findOne: jest.fn(() => reminder),
            removeReminder: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            selectReminder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = app.get<RemindersService>(RemindersService);
    controller = app.get<RemindersController>(RemindersController);
  });
  describe('compile', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should successfully insert a reminder', async () => {
      const spyCreate = jest.spyOn(service, 'create');
      expect(await controller.create(reminder, userData as any)).toEqual(
        newReminder,
      );
      expect(spyCreate).toHaveBeenCalledWith({
        ...reminder,
        status: false,
        userId: userData.id,
      });
    });
  });

  describe('findAll()', () => {
    it('should return an array of reminders', async () => {
      const reminders = await controller.findAll(userData as any);
      expect(reminders).toEqual(remindersArray);
    });
  });

  describe('findOne()', () => {
    it('should return one reminder', async () => {
      const reminder = await controller.findOne(id, userData as any);
      expect(reminder).toEqual(reminder);
    });
  });

  describe('update()', () => {
    it('should update a reminder', async () => {
      const spyUpdate = jest.spyOn(service, 'update');
      await controller.update(id, userData as any, reminder);
      expect(spyUpdate).toBeCalledWith(reminder, userData.id);
    });
  });

  describe('removeReminder()', () => {
    it('should remove an existing reminder', async () => {
      const removeSpy = jest.spyOn(service, 'removeReminder');
      await controller.removeReminder(id, userData as any);

      expect(removeSpy).toHaveBeenCalledWith(id, userData.id);
    });
  });

  describe('selectReminder()', () => {
    it('should change status key of the selected reminder while switch the rest of reminders status key to false', async () => {
      const spySelectReminder = jest.spyOn(service, 'selectReminder');
      await controller.selectReminder(id, userData as any);
      expect(spySelectReminder).toHaveBeenCalledWith(id, userData.id);
    });
  });
});
