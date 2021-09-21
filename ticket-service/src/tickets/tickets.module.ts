import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './repositories/tickets.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
} from './events/publishers';
import { natsClient } from '@mvctickets/common';
import {
  OrderCancelledListener,
  OrderCreatedListener,
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

          return TicketSchema;
        },
      },
    ]),
  ],
  controllers: [TicketsController],
  providers: [
    TicketsRepository,
    TicketsService,
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
    TicketCreatedPublisher,
    TicketUpdatedPublisher,
    OrderCreatedListener,
    OrderCancelledListener,
  ],
})
export class TicketsModule {}
