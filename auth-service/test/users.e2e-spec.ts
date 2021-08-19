import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { UsersRepository } from '../src/users/repositories/users.repository';
import * as cookieParser from 'cookie-parser';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  let mongo: MongoMemoryServer;
  let databaseUrl: string;
  let connection: mongoose.Connection;

  let email: string;
  let name: string;
  let password: string;

  let usersRepository: UsersRepository;

  const createTestUser = async () => {
    return usersRepository.create({
      email,
      name,
      password,
    });
  };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    databaseUrl = `${mongo.getUri()}tests`;

    email = 'any_mail@mail.com';
    name = 'any_name';
    password = '123456';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(databaseUrl),
        ConfigModule.forRoot(),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    connection = await moduleFixture.get(getConnectionToken());

    app.use(cookieParser());

    usersRepository = app.get(UsersRepository);

    await app.init();
  });

  afterEach(async () => {
    await connection.dropCollection('users');
    await connection.close(true);
  });

  afterAll(async () => {
    await mongo.stop();
  });

  describe('POST /users/sign-up', () => {
    it('should return 201 with sign up user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/sign-up')
        .send({
          email,
          name,
          password,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(email);
      expect(response.body.name).toBe(name);
    });

    it('should return 400 if email already exists', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer())
        .post('/users/sign-up')
        .send({
          email,
          name,
          password,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('E-mail already exists');
    });
  });

  describe('POST /users/sign-in', () => {
    it('should return 200 with user data', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send({
          email,
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.body.user).toEqual(
        expect.objectContaining({
          name,
          email,
        }),
      );
    });

    it('should return 401 when email is invalid', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send({
          email: 'invalid_mail@mail.com',
          password,
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('E-mail or password is invalid');
    });

    it('should return 401 when password is invalid', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send({
          email,
          password: 'invalid_password',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('E-mail or password is invalid');
    });
  });

  describe('POST /users/sign-out', () => {
    it('should return 200 and clear cookies', async () => {
      await createTestUser();

      const responseAuth = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send({
          email,
          password,
        });

      const cookie = responseAuth.headers['set-cookie'];

      const response = await request(app.getHttpServer())
        .post('/users/sign-out')
        .set('cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0]).toMatch(/jwt=;/);
    });
  });

  describe('GET /users/me', () => {
    it('should return 200 with user data', async () => {
      await createTestUser();

      const responseAuth = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send({
          email,
          password,
        });

      const cookie = responseAuth.headers['set-cookie'];

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          name,
          email,
        }),
      );
    });

    it('should return 400 with no token is provided', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer()).get('/users/me');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('token is not provided');
    });

    it('should return 400 if token is invalid', async () => {
      await createTestUser();

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('cookie', 'jwt=invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });
});
