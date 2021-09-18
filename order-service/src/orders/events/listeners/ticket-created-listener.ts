import { Listener, Subjects, TicketCreatedEvent } from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { TicketsRepository } from 'src/orders/repositories/tickets.repository';
import { QUEUE_GROUP_NAME } from './index';

const logger = new Logger('TicketCreatedListener');

@Injectable()
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ticketsRepository: TicketsRepository,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    logger.log(`Ticket created data: ${JSON.stringify(data)}`);

    const { id, title, price } = data;

    const ticket = await this.ticketsRepository.create({
      _id: id,
      price,
      title,
    });

    logger.log(`Ticket inserted: ${JSON.stringify(ticket)}`);

    msg.ack();
  }
}
