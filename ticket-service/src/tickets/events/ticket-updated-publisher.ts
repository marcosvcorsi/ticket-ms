import { Publisher, Subjects, TicketUpdatedEvent } from '@mvctickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';

@Injectable()
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);
  }

  readonly subject = Subjects.TicketUpdated;
}
