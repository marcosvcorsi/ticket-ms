import { Listener, Subjects, TicketUpdatedEvent } from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { TicketsRepository } from 'src/orders/repositories/tickets.repository';
import { QUEUE_GROUP_NAME } from './index';

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

    const { id, title, price, version } = data;

    logger.log(
      `Ticket values ${JSON.stringify(
        await this.ticketsRepository.findById(id),
      )}`,
    );

    const ticket = await this.ticketsRepository.findByIdAndVersion(id, version);

    if (!ticket) {
      logger.warn(`Ticket with id ${id} and version ${version} not found`);
      return;
    }

    await this.ticketsRepository.update(id, { title, price });

    logger.log(
      `Ticket updated: ${JSON.stringify({ id, title, price, version })}`,
    );

    msg.ack();
  }
}
