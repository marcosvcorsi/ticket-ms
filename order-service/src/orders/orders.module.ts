import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { OrdersRepository } from './repositories/orders.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketsService } from './services/tickets.service';
import { natsClient } from '@mvctickets/common';
import { OrderCreatedPublisher } from './events/order-created-publisher';
import { OrderCancelledPublisher } from './events/order-cancelled-publisher';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    {
      provide: 'NATS_CLIENT',
      useFactory: async () => {
        const client = await natsClient.connect({
          clusterId: process.env.NATS_CLUSTER_ID,
          clientId: process.env.NATS_CLIENT_ID,
          url: process.env.NATS_URL,
        });

        return client;
      },
    },
    OrdersRepository,
    TicketsRepository,
    TicketsService,
    OrdersService,
    OrderCreatedPublisher,
    OrderCancelledPublisher,
  ],
})
export class OrdersModule {}
