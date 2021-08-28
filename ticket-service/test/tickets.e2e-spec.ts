import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TicketsModule } from '../src/tickets/tickets.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../src/shared/strategies/jwt.strategy';
import * as cookieParser from 'cookie-parser';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('TicketsController (e2e)', () => {
  let mongo: MongoMemoryServer;
  let connection: mongoose.Connection;

  let jwtService: JwtService;

  let app: INestApplication;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(`${mongo.getUri()}tests`),
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        PassportModule.register({
          defaultStrategy: 'jwt',
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '15m',
          },
        }),
        TicketsModule,
      ],
      providers: [JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();

    jwtService = app.get(JwtService);

    connection = await moduleFixture.get(getConnectionToken());
  });

  afterEach(async () => {
    await connection.close(true);
  });

  afterAll(async () => {
    await mongo.stop();
  });

  describe('POST /tickets', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 201 with created ticket', async () => {
      const token = await jwtService.sign({ id: 'any_id' });

      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send()
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(201);
    });
  });
});
