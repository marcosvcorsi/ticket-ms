import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './repositories/tickets.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { natsClient } from '@mvctickets/common';

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
          clusterId: 'ticketing',
          clientId: 'abc',
          url: 'http://nats-service:4222',
        });

        return client;
      },
    },
    TicketCreatedPublisher,
  ],
})
export class TicketsModule {}
