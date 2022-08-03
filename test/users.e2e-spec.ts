import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as shell from 'shelljs';

import { User } from '../src/entities/user.entity';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

describe('userController (e2e)', () => {
  const error = [
    'password should not be empty',
    'password must be a string',
    'password must be longer than or equal to 6 characters',
    'invalid e-mail format',
    'email should not be empty',
    'email must be a string',
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
      expect(message[0]).toBe(error[3]);
    });
    it(' POST /users with incorrect body - incorrect email', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(incorrectPassLogin);
      const {
        body: { message },
      } = res;
      expect(res.statusCode).toEqual(400);
      expect(message[0]).toBe(error[2]);
    });
    it(' POST /users with incorrect body - no email and no password key', async () => {
      const res = await request(app.getHttpServer()).post('/users').send();
      const {
        body: { message },
      } = res;
      expect(res.statusCode).toEqual(400);
      expect(message).toStrictEqual(error);
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
      await request(app.getHttpServer()).post('/users').send(correctEmailLogin);
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(correctEmailLogin);
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toBe('Credentials taken');
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
    // beforeAll(() => shell.exec('npm run pretest'));

    beforeEach(() => User.sync({ force: true }));

    it(' POST /login with incorrect credential - incorrect email', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send(incorrectEmailLogin);
      const {
        body: { message },
      } = res;
      expect(res.statusCode).toEqual(400);
      expect(message[0]).toBe(error[3]);
    });
    it(' POST /login with incorrect credential - incorrect email', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send(incorrectPassLogin);
      const {
        body: { message },
      } = res;
      expect(res.statusCode).toEqual(400);
      expect(message[0]).toBe(error[2]);
    });
    it(' POST /login with incorrect credential - no email and no password key', async () => {
      const res = await request(app.getHttpServer()).post('/login').send();
      const {
        body: { message },
      } = res;
      expect(res.statusCode).toEqual(400);
      expect(message).toStrictEqual(error);
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
      await request(app.getHttpServer()).post('/users').send(correctEmailLogin);
      const {
        body: { token },
      } = await request(app.getHttpServer())
        .post('/login')
        .send(correctEmailLogin);
      expect(typeof token).toBe('string');
    });
  });
});
