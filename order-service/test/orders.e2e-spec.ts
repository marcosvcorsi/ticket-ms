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
import { OrdersModule } from '../src/orders/orders.module';
import * as cookieParser from 'cookie-parser';
import { TicketsRepository } from '../src/orders/repositories/tickets.repository';
import { OrdersRepository } from '../src/orders/repositories/orders.repository';
import { OrderStatus } from '@mvctickets/common';

describe('OrdersController (e2e)', () => {
  let mongo: MongoMemoryServer;
  let connection: mongoose.Connection;
  let jwtService: JwtService;
  let ticketsRepository: TicketsRepository;
  let ordersRepository: OrdersRepository;

  let userId: string;
  let ticketId: string;

  let app: INestApplication;

  beforeAll(async () => {
    userId = 'any_user_id';
    ticketId = new mongoose.Types.ObjectId().toHexString();

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

    jwtService = app.get(JwtService);
    ticketsRepository = app.get(TicketsRepository);
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

  describe('GET /orders', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer()).get('/orders').send();

      expect(response.status).toBe(401);
    });

    it('should return 200 with orders on success', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      const order = await ordersRepository.create({
        userId,
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
      });

      await ordersRepository.create({
        userId: 'other_user_id',
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(200);
      expect(response.body[0].id).toBe(order._id.toString());
      expect(response.body[0].status).toBe(order.status);
      expect(response.body[0].ticket.id).toBe(ticket._id.toString());
      expect(response.body[0].userId).toBe(userId);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/any_id')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 404 when order not found', async () => {
      const token = await jwtService.sign({ id: userId });

      const orderId = new mongoose.Types.ObjectId().toHexString();

      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Order with id ${orderId.toString()} not found`,
      );
    });

    it('should return 404 when order not found', async () => {
      const anotherUserToken = await jwtService.sign({ id: 'another_user_id' });

      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      const order = await ordersRepository.create({
        userId,
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get(`/orders/${order._id}`)
        .set('cookie', `jwt=${anotherUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('User cannot access this resource');
    });

    it('should return 200 with order on success', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      const order = await ordersRepository.create({
        userId,
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get(`/orders/${order._id}`)
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(order._id.toString());
      expect(response.body.status).toBe(order.status);
      expect(response.body.ticket.id).toBe(ticket._id.toString());
      expect(response.body.userId).toBe(userId);
    });
  });

  describe('POST /orders', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should return 404 when ticket not found', async () => {
      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          ticketId,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        `Ticket with id ${ticketId.toString()} not found`,
      );
    });

    it('should return 400 when ticket is already reserved with an order status Created', async () => {
      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      await ordersRepository.create({
        userId,
        status: OrderStatus.Created,
        ticket,
        expiresAt: new Date(),
      });

      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          ticketId: ticket._id,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ticket is already reserved');
    });

    it('should return 400 when ticket is already reserved with an order status AwaitingPayment', async () => {
      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      await ordersRepository.create({
        userId,
        status: OrderStatus.AwaitingPayment,
        ticket,
        expiresAt: new Date(),
      });

      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          ticketId: ticket._id,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ticket is already reserved');
    });

    it('should return 400 when ticket is already reserved with an order status Complete', async () => {
      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      await ordersRepository.create({
        userId,
        status: OrderStatus.Complete,
        ticket,
        expiresAt: new Date(),
      });

      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          ticketId: ticket._id,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ticket is already reserved');
    });

    it('should return 201 with a new order', async () => {
      const ticket = await ticketsRepository.create({
        price: 10,
        title: 'any_title',
      });

      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          ticketId: ticket._id,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe(OrderStatus.Created);
      expect(response.body.userId).toBe(userId);
      expect(response.body.ticket).toEqual(
        expect.objectContaining({
          price: ticket.price,
          title: ticket.title,
        }),
      );
    });
  });

  describe('DELETE /orders/id', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .delete('/orders/any_id')
        .send();

      expect(response.status).toBe(401);
    });
  });
});
