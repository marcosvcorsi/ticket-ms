import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../src/shared/strategies/jwt.strategy';
import { OrdersModule } from '../src/orders/orders.module';
import * as cookieParser from 'cookie-parser';

describe('OrdersController (e2e)', () => {
  let mongo: MongoMemoryServer;
  let connection: mongoose.Connection;

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
        OrdersModule,
      ],
      providers: [JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();

    connection = await moduleFixture.get(getConnectionToken());
  });

  afterEach(async () => {
    await connection.dropDatabase();
    await connection.close(true);
  });

  afterAll(async () => {
    await mongo.stop();
  });

  describe('GET /orders', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer()).get('/orders').send();

      expect(response.status).toBe(401);
    });
  });
});
