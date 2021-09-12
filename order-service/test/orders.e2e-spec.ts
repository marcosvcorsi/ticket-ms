import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../src/orders/orders.module';

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
        OrdersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .send();

      expect(response.status).toBe(401);
    });
  });
});
