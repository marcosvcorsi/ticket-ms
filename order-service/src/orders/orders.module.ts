import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderSchema } from './schemas/order.schema';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { OrdersRepository } from './repositories/orders.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketsService } from './services/tickets.service';
import { natsClient } from '@mvctickets/common';
import {
  OrderCreatedPublisher,
  OrderCancelledPublisher,
} from './events/publishers';
import {
  ExpirationCompleteListener,
  PaymentCreatedListener,
  TicketCreatedListener,
  TicketUpdatedListener,
} from './events/listeners';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Ticket.name,
        useFactory: async () => {
          const schema = TicketSchema;

          schema.set('versionKey', 'version');
          schema.pre('findOneAndUpdate', function () {
            const update = this.getUpdate() as any;
            if (update.version != null) {
              delete update.version;
            }
            const keys = ['$set', '$setOnInsert'];
            for (const key of keys) {
              if (update[key] != null && update[key].version != null) {
                delete update[key].version;
                if (Object.keys(update[key]).length === 0) {
                  delete update[key];
                }
              }
            }
            update.$inc = update.$inc || {};
            update.$inc.version = 1;
          });
          schema.plugin(updateIfCurrentPlugin);

          return schema;
        },
      },
      {
        name: Order.name,
        useFactory: async () => {
          const schema = OrderSchema;

          schema.set('versionKey', 'version');
          schema.pre('findOneAndUpdate', function () {
            const update = this.getUpdate() as any;
            if (update.version != null) {
              delete update.version;
            }
            const keys = ['$set', '$setOnInsert'];
            for (const key of keys) {
              if (update[key] != null && update[key].version != null) {
                delete update[key].version;
                if (Object.keys(update[key]).length === 0) {
                  delete update[key];
                }
              }
            }
            update.$inc = update.$inc || {};
            update.$inc.version = 1;
          });
          schema.plugin(updateIfCurrentPlugin);

          return schema;
        },
      },
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
    TicketCreatedListener,
    TicketUpdatedListener,
    ExpirationCompleteListener,
    PaymentCreatedListener,
  ],
})
export class OrdersModule {}
