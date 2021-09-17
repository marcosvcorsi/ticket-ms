import { Publisher, OrderCreatedEvent, Subjects } from '@mvctickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';

@Injectable()
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);
  }

  readonly subject = Subjects.OrderCreated;
}
