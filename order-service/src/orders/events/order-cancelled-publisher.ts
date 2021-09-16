import { OrderCancelledEvent, Publisher, Subjects } from '@mvctickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';

@Injectable()
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);
  }

  readonly subject = Subjects.OrderCancelled;
}
