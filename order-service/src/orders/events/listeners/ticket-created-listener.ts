import { Listener, Subjects, TicketCreatedEvent } from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';

const logger = new Logger('TicketCreatedListener');

@Injectable()
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = 'order-service';

  constructor(@Inject('NATS_CLIENT') client: Stan) {
    super(client);

    this.listen();
  }

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    logger.log(`Ticket created: ${JSON.stringify(data)}`);

    msg.ack();
  }
}
