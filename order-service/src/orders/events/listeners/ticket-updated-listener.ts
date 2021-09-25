import { Listener, Subjects, TicketUpdatedEvent } from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from '..';
import { TicketsRepository } from '../../repositories/tickets.repository';

const logger = new Logger('TicketUpdatedListener');

@Injectable()
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ticketsRepository: TicketsRepository,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    logger.log(`Ticket updated data: ${JSON.stringify(data)}`);

    const { id, title, price, orderId, version } = data;

    const ticket = await this.ticketsRepository.findByIdAndVersion(id, version);

    if (!ticket) {
      logger.warn(`Ticket with id ${id} and version ${version} not found`);
      return;
    }

    const ticketUpdated = await this.ticketsRepository.update(id, {
      title,
      price,
      orderId,
    });

    logger.log(`Ticket updated: ${JSON.stringify(ticketUpdated)}`);

    msg.ack();
  }
}
