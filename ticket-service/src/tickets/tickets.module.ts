import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './repositories/tickets.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { natsClient } from '@mvctickets/common';
import { TicketUpdatedPublisher } from './events/ticket-updated-publisher';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
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
  ],
})
export class TicketsModule {}
