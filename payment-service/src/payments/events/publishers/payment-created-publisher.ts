import { PaymentCreatedEvent, Publisher, Subjects } from '@mvctickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';

@Injectable()
export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;

  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);
  }
}
