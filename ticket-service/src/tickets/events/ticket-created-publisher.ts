import { Publisher, Subjects, TicketCreatedEvent } from '@mvctickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';

@Injectable()
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);
  }

  readonly subject = Subjects.TicketCreated;
}
