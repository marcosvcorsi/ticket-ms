import { Listener, OrderCreatedEvent, Subjects } from '@mvctickets/common';
import { Inject, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { Ticket } from 'src/tickets/models/ticket.model';
import { TicketsRepository } from '../../repositories/tickets.repository';
import { TicketUpdatedPublisher } from '../publishers';
import { QUEUE_GROUP_NAME } from './index';

const logger = new Logger('OrderCreatedListener');

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketUpdatedPublisher: TicketUpdatedPublisher,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    logger.log(`Order created data: ${JSON.stringify(data)}`);

    const { id, ticket } = data;

    const ticketDocument = await this.ticketsRepository.findById(ticket.id);

    if (!ticketDocument) {
      logger.warn(`Ticket with id ${id} not found`);
      return;
    }

    const ticketUpdated = await this.ticketsRepository.update(ticket.id, {
      orderId: id,
    });

    logger.log(`Ticket updated: ${JSON.stringify(ticketUpdated)}`);

    await this.ticketUpdatedPublisher.publish(
      Ticket.fromDocument(ticketUpdated),
    );

    msg.ack();
  }
}
