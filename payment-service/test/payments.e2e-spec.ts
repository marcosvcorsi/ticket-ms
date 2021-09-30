import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../src/shared/strategies/jwt.strategy';
import * as cookieParser from 'cookie-parser';
import { OrdersRepository } from '../src/payments/repositories/orders.repository';
import { PaymentsModule } from '../src/payments/payments.module';
import {
  OrderCancelledListener,
  OrderCreatedListener,
} from '../src/payments/events/listeners';
import { OrderStatus } from '@mvctickets/common';
import { StripeGateway } from '../src/payments/gateways/stripe.gateway';

describe('PaymentsController (e2e)', () => {
  let mongo: MongoMemoryServer;
  let connection: mongoose.Connection;
  let jwtService: JwtService;
  let ordersRepository: OrdersRepository;

  let userId: string;
  let orderId: string;
  let chargeId: string;
  let token: string;

  let app: INestApplication;

  const stripeGateway = {
    charge: jest.fn(),
  };

  beforeAll(async () => {
    userId = 'any_user_id';
    token = 'any_token';
    chargeId = 'any_charge_id';
    orderId = new mongoose.Types.ObjectId().toHexString();

    stripeGateway.charge.mockResolvedValue({ id: chargeId });

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
        PaymentsModule,
      ],
      providers: [JwtStrategy],
    })
      .overrideProvider('NATS_CLIENT')
      .useValue({})
      .overrideProvider(OrderCancelledListener)
      .useValue({})
      .overrideProvider(OrderCreatedListener)
      .useValue({})
      .overrideProvider(StripeGateway)
      .useValue(stripeGateway)
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();

    jwtService = app.get(JwtService);
    ordersRepository = app.get(OrdersRepository);

    connection = await moduleFixture.get(getConnectionToken());
  });

  afterEach(async () => {
    await connection.dropDatabase();
    await connection.close(true);
  });

  afterAll(async () => {
    await mongo.stop();
  });

  describe('POST /payments', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should return 404 when order not found', async () => {
      const jwt = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({
          token,
          orderId,
        })
        .set('cookie', `jwt=${jwt}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Order with id ${orderId.toString()} not found`,
      );
    });

    it('should return 403 when order its own by other user', async () => {
      await ordersRepository.create({
        _id: orderId,
        userId: 'other_user_id',
        status: OrderStatus.Created,
        price: 10,
      });

      const jwt = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({
          orderId,
          token,
        })
        .set('cookie', `jwt=${jwt}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You can't pay for this order");
    });

    it('should return 400 when order is already cancelled', async () => {
      await ordersRepository.create({
        _id: orderId,
        userId,
        status: OrderStatus.Cancelled,
        price: 10,
      });

      const jwt = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({
          orderId,
          token,
        })
        .set('cookie', `jwt=${jwt}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("You can't pay for a cancelled order");
    });

    it('should return 204 on success', async () => {
      const order = await ordersRepository.create({
        _id: orderId,
        userId,
        status: OrderStatus.Created,
        price: 10,
      });

      const jwt = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/payments')
        .send({
          orderId,
          token,
        })
        .set('cookie', `jwt=${jwt}`);

      expect(stripeGateway.charge).toHaveBeenCalledWith(token, order.price);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({ chargeId }));
    });
  });
});
