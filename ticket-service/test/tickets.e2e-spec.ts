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
import { TicketsRepository } from '../src/tickets/repositories/tickets.repository';
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
} from '../src/tickets/events/publishers';
import {
  OrderCancelledListener,
  OrderCreatedListener,
} from '../src/tickets/events/listeners';

describe('TicketsController (e2e)', () => {
  let mongo: MongoMemoryServer;
  let connection: mongoose.Connection;

  let jwtService: JwtService;
  let ticketsRepository: TicketsRepository;

  let app: INestApplication;

  let title: string;
  let price: number;
  let userId: string;

  const publisher = {
    publish: jest.fn(),
  };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    title = 'any_title';
    price = 10;
    userId = 'any_user_id';
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
    })
      .overrideProvider('NATS_CLIENT')
      .useValue({})
      .overrideProvider(TicketCreatedPublisher)
      .useValue(publisher)
      .overrideProvider(TicketUpdatedPublisher)
      .useValue(publisher)
      .overrideProvider(OrderCreatedListener)
      .useValue({})
      .overrideProvider(OrderCancelledListener)
      .useValue({})

      .compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();

    jwtService = app.get(JwtService);
    ticketsRepository = app.get(TicketsRepository);

    connection = await moduleFixture.get(getConnectionToken());
  });

  afterEach(async () => {
    await connection.dropDatabase();
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
      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send({
          title,
          price,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(title);
      expect(response.body.price).toBe(price);
      expect(response.body.userId).toBe(userId);
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(mongoose.Types.ObjectId),
          title: response.body.title,
          price: response.body.price,
          userId: response.body.userId,
        }),
      );
    });
  });

  describe('GET /tickets/:id', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets/any_id')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 404 when ticket not found', async () => {
      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .get(`/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 200 with ticket', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        title,
        price,
        userId,
      });

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticket._id}`)
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticket._id.toString());
      expect(response.body.title).toBe(ticket.title);
      expect(response.body.price).toBe(ticket.price);
    });
  });

  describe('GET /tickets', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 200 with all tickets', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        title,
        price,
        userId,
      });

      const response = await request(app.getHttpServer())
        .get('/tickets')
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(ticket._id.toString());
    });
  });

  describe('PUT /tickets/:id', () => {
    it('should return 401 when token is not provided', async () => {
      const response = await request(app.getHttpServer())
        .put('/tickets/any_id')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 404 when ticket not found', async () => {
      const token = await jwtService.sign({ id: userId });

      const response = await request(app.getHttpServer())
        .put(`/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
        .send({
          title,
          price,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 when ticket is not from requesting user', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        title,
        price,
        userId: 'other_user_id',
      });

      const response = await request(app.getHttpServer())
        .put(`/tickets/${ticket.id}`)
        .send({
          title,
          price,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(403);
    });

    it('should return 403 when ticket is reserved', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        title,
        price,
        userId: 'other_user_id',
        orderId: 'any_orderId',
      });

      const response = await request(app.getHttpServer())
        .put(`/tickets/${ticket.id}`)
        .send({
          title,
          price,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(403);
    });

    it('should return 200 with ticket', async () => {
      const token = await jwtService.sign({ id: userId });

      const ticket = await ticketsRepository.create({
        title,
        price,
        userId,
      });

      const response = await request(app.getHttpServer())
        .put(`/tickets/${ticket._id}`)
        .send({
          title: `${title}_2`,
          price: price + 1,
        })
        .set('cookie', `jwt=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticket._id.toString());
      expect(response.body.title).toBe(`${ticket.title}_2`);
      expect(response.body.price).toBe(ticket.price + 1);
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(mongoose.Types.ObjectId),
          title: response.body.title,
          price: response.body.price,
          userId: response.body.userId,
        }),
      );
    });
  });
});
