import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as shell from 'shelljs';

import { User } from '../src/entities/user.entity';
import { Reminder } from '../src/entities/reminder.entity';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { CreateReminderDto } from '../src/reminders/dto/create-reminder.dto';

describe('app (e2e)', () => {
  const errorUsers = [
    'password should not be empty',
    'password must be a string',
    'password must be longer than or equal to 6 characters',
    'invalid e-mail format',
    'email should not be empty',
    'email must be a string',
  ];

  const errorReminders = [
    'title should not be empty',
    'title must be a string',
    'title must be longer than or equal to 3 characters',
    'description must be longer than or equal to 10 characters',
    'description should not be empty',
    'description must be a string',
  ];

  let app: INestApplication;

  const correctEmailLogin: CreateUserDto = {
    email: 'teste@teste.com',
    password: '123456',
  };

  const incorrectEmailLogin: CreateUserDto = {
    email: 'teste',
    password: '123456',
  };

  const incorrectPassLogin: CreateUserDto = {
    email: 'teste@test.com',
    password: '123',
  };

  const updatedLogin: CreateUserDto = {
    email: 'updated-teste@teste.com',
    password: 'update-123456',
  };

  const correctReminder: CreateReminderDto = {
    title: 'teste',
    description: '..........',
  };

  const correctReminder2: CreateReminderDto = {
    title: 'teste2',
    description: '..........',
  };

  const incorrectTitleReminder: CreateReminderDto = {
    title: 'te',
    description: '.................',
  };

  const incorrectDescriptionReminder: CreateReminderDto = {
    title: 'teste',
    description: '...',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(() => app.close());

  describe('/users route', () => {
    describe('POST method', () => {
      beforeAll(() => shell.exec('npm run pretest'));
      beforeEach(() => User.sync({ force: true }));
      it(' POST /users with incorrect body - incorrect email', async () => {
        const res = await request(app.getHttpServer())
          .post('/users')
          .send(incorrectEmailLogin);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorUsers[3]);
      });
      it(' POST /users with incorrect body - incorrect email', async () => {
        const res = await request(app.getHttpServer())
          .post('/users')
          .send(incorrectPassLogin);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorUsers[2]);
      });
      it(' POST /users with incorrect body - no email and no password key', async () => {
        const res = await request(app.getHttpServer()).post('/users').send();
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message).toStrictEqual(errorUsers);
      });
      it(' POST /users with correct credential', async () => {
        const res = await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('created_at');
      });

      it(' POST /users with correct credential but an existing email', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const res = await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe('Credentials taken');
      });
    });
  });
  describe(' /users/id route', () => {
    const id = 1;
    // beforeAll(() => shell.exec('npm run pretest'));

    beforeEach(() => User.sync({ force: true }));
    describe('PATCH method', () => {
      it('should return an not acceptable error', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        const res = await request(app.getHttpServer())
          .patch(`/users/teste`)
          .send(updatedLogin)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(406);
        expect(res.body.error).toEqual('Not Acceptable');
      });
      it('should return an unauthorized error', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/users/${id}`)
          .send(updatedLogin);
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Unauthorized');
      });
      it('should update an user', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        const res = await request(app.getHttpServer())
          .patch(`/users/${id}`)
          .send(updatedLogin)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(204);
      });
    });
    describe('DELETE method', () => {
      it('should return an not acceptable error', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        const res = await request(app.getHttpServer())
          .delete(`/users/teste`)
          .send(updatedLogin)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(406);
        expect(res.body.error).toEqual('Not Acceptable');
      });
      it('should return an unauthorized error', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/users/${id}`)
          .send(updatedLogin);
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Unauthorized');
      });
      it('should update an user', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        const res = await request(app.getHttpServer())
          .delete(`/users/${id}`)
          .send(updatedLogin)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(204);
      });
    });
  });

  describe('/login route', () => {
    describe('POST method', () => {
      beforeEach(() => User.sync({ force: true }));
      it(' POST /login with incorrect credential - incorrect email', async () => {
        const res = await request(app.getHttpServer())
          .post('/login')
          .send(incorrectEmailLogin);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorUsers[3]);
      });
      it(' POST /login with incorrect credential - incorrect email', async () => {
        const res = await request(app.getHttpServer())
          .post('/login')
          .send(incorrectPassLogin);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorUsers[2]);
      });
      it(' POST /login with incorrect credential - no email and no password key', async () => {
        const res = await request(app.getHttpServer()).post('/login').send();
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message).toStrictEqual(errorUsers);
      });
      it(' POST /login with incorrect credential - non existing email(empty database)', async () => {
        const res = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(403);
        expect(message).toStrictEqual('Invalid credentials');
      });

      it(' POST /login with correct credential - existing email', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        expect(typeof token).toBe('string');
      });
    });
  });
  describe('/reminders route', () => {
    let token: string;
    describe('POST method', () => {
      beforeEach(async () => Reminder.sync({ force: true }));

      it(' POST /reminders with incorrect body - incorrect title', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        const res = await request(app.getHttpServer())
          .post('/reminders')
          .send(incorrectTitleReminder)
          .set('authorization', `bearer ${token}`);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorReminders[2]);
      });
      it(' POST /reminders with incorrect body - incorrect description', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        const res = await request(app.getHttpServer())
          .post('/reminders')
          .send(incorrectDescriptionReminder)
          .set('authorization', `bearer ${token}`);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorReminders[3]);
      });
      it(' POST /reminders with incorrect body - missing description key', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        const res = await request(app.getHttpServer())
          .post('/reminders')
          .send({ title: 'teste' })
          .set('authorization', `bearer ${token}`);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorReminders[3]);
        expect(message[1]).toBe(errorReminders[4]);
        expect(message[2]).toBe(errorReminders[5]);
      });
      it(' POST /reminders with incorrect body - missing title key', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        const res = await request(app.getHttpServer())
          .post('/reminders')
          .send({ description: 'teste' })
          .set('authorization', `bearer ${token}`);
        const {
          body: { message },
        } = res;
        expect(res.statusCode).toEqual(400);
        expect(message[0]).toBe(errorReminders[0]);
        expect(message[1]).toBe(errorReminders[1]);
        expect(message[2]).toBe(errorReminders[2]);
      });
      it(' POST /reminders with correct body', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        const res = await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const { body } = res;
        expect(res.statusCode).toEqual(201);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('title');
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('created_at');
      });
    });

    describe('GET method', () => {
      describe('GET /reminders', () => {
        let token: string;
        beforeEach(async () => Reminder.sync({ force: true }));
        it(' GET /reminders', async () => {
          await request(app.getHttpServer())
            .post('/users')
            .send(correctEmailLogin);
          const {
            body: { token: response },
          } = await request(app.getHttpServer())
            .post('/login')
            .send(correctEmailLogin);
          token = response;
          await request(app.getHttpServer())
            .post('/reminders')
            .send(correctReminder)
            .set('authorization', `bearer ${token}`);
          await request(app.getHttpServer())
            .post('/reminders')
            .send(correctReminder2)
            .set('authorization', `bearer ${token}`);
          const res = await request(app.getHttpServer())
            .get('/reminders')
            .set('authorization', `bearer ${token}`);
          const { body } = res;
          expect(res.statusCode).toEqual(200);
          expect(Array.isArray(body)).toBeTruthy();
          expect(body[0]).toHaveProperty('id');
          expect(body[0]).toHaveProperty('title');
          expect(body[0]).toHaveProperty('userId');
          expect(body[0]).toHaveProperty('createdAt');
          expect(body[0]).toHaveProperty('updatedAt');
        });
        it(' GET /reminders with empty database', async () => {
          await request(app.getHttpServer())
            .post('/users')
            .send(correctEmailLogin);
          const {
            body: { token: response },
          } = await request(app.getHttpServer())
            .post('/login')
            .send(correctEmailLogin);
          token = response;
          const res = await request(app.getHttpServer())
            .get('/reminders')
            .set('authorization', `bearer ${token}`);
          const { body } = res;
          expect(res.statusCode).toEqual(404);
          expect(body.message).toBe(
            'sorry, no data found related to the requested user',
          );
        });
      });
      describe('GET /reminders/id', () => {
        const id = 1;
        let token: string;
        beforeEach(async () => Reminder.sync({ force: true }));
        it(' GET /reminders/id', async () => {
          await request(app.getHttpServer())
            .post('/users')
            .send(correctEmailLogin);
          const {
            body: { token: response },
          } = await request(app.getHttpServer())
            .post('/login')
            .send(correctEmailLogin);
          token = response;
          await request(app.getHttpServer())
            .post('/reminders')
            .send(correctReminder)
            .set('authorization', `bearer ${token}`);
          const res = await request(app.getHttpServer())
            .get(`/reminders/${id}`)
            .set('authorization', `bearer ${token}`);
          const { body } = res;
          expect(res.statusCode).toEqual(200);
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('title');
          expect(body).toHaveProperty('userId');
          expect(body).toHaveProperty('createdAt');
          expect(body).toHaveProperty('updatedAt');
        });
        it(' GET /reminders/id with invalid id', async () => {
          await request(app.getHttpServer())
            .post('/users')
            .send(correctEmailLogin);
          const {
            body: { token: response },
          } = await request(app.getHttpServer())
            .post('/login')
            .send(correctEmailLogin);
          token = response;
          await request(app.getHttpServer())
            .post('/reminders')
            .send(correctReminder)
            .set('authorization', `bearer ${token}`);
          const res = await request(app.getHttpServer())
            .get(`/reminders/teste`)
            .set('authorization', `bearer ${token}`);
          const { body } = res;
          expect(res.statusCode).toEqual(406);
          expect(body.error).toBe('Not Acceptable');
        });
        it(' GET /reminders/id with non existing id', async () => {
          await request(app.getHttpServer())
            .post('/users')
            .send(correctEmailLogin);
          const {
            body: { token: response },
          } = await request(app.getHttpServer())
            .post('/login')
            .send(correctEmailLogin);
          token = response;
          await request(app.getHttpServer())
            .post('/reminders')
            .send(correctReminder)
            .set('authorization', `bearer ${token}`);
          const res = await request(app.getHttpServer())
            .get(`/reminders/100`)
            .set('authorization', `bearer ${token}`);
          const { body } = res;
          expect(res.statusCode).toEqual(404);
          expect(body.message).toBe('user not found');
        });
      });
    });
    describe('PATCH /reminders/id', () => {
      const id = 1;
      let token: string;
      beforeEach(async () => Reminder.sync({ force: true }));
      it(' PATCH /reminders/id with valid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .patch(`/reminders/${id}`)
          .set('authorization', `bearer ${token}`);
        const { body } = res;
        expect(res.statusCode).toEqual(200);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('title');
        expect(body).toHaveProperty('description');
        expect(body).toHaveProperty('status');
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');
        expect(body.status).toBeTruthy();
      });
      it(' PATCH /reminders/id with invalid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .patch('/reminders/test')
          .set('authorization', `bearer ${token}`);
        const { body } = res;
        expect(res.statusCode).toEqual(406);
        expect(body.error).toBe('Not Acceptable');
      });
    });
    describe('PUT /reminders/id', () => {
      const id = 1;
      let token: string;
      beforeEach(async () => Reminder.sync({ force: true }));
      it(' PUT /reminders/id with valid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .put(`/reminders/${id}`)
          .send(correctReminder2)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(204);
      });
      it(' PUT /reminders/id with invalid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .put('/reminders/test')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const { body } = res;
        expect(res.statusCode).toEqual(406);
        expect(body.error).toBe('Not Acceptable');
      });
    });
    describe('DELETE /reminders/id', () => {
      const id = 1;
      let token: string;
      beforeEach(async () => Reminder.sync({ force: true }));
      it(' DELETE /reminders/id with valid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .delete(`/reminders/${id}`)
          .send(correctReminder2)
          .set('authorization', `bearer ${token}`);
        expect(res.statusCode).toEqual(204);
      });
      it(' DELETE /reminders/id with invalid id', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send(correctEmailLogin);
        const {
          body: { token: response },
        } = await request(app.getHttpServer())
          .post('/login')
          .send(correctEmailLogin);
        token = response;
        await request(app.getHttpServer())
          .post('/reminders')
          .send(correctReminder)
          .set('authorization', `bearer ${token}`);
        const res = await request(app.getHttpServer())
          .delete('/reminders/test')
          .set('authorization', `bearer ${token}`);
        const { body } = res;
        expect(res.statusCode).toEqual(406);
        expect(body.error).toBe('Not Acceptable');
      });
    });
  });
});
