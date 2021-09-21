import { Listener, OrderCancelledEvent, Subjects } from '@mvctickets/common';
import { Inject, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket.model';
import { TicketsRepository } from '../../repositories/tickets.repository';
import { TicketUpdatedPublisher } from '../publishers';
import { QUEUE_GROUP_NAME } from './index';

const logger = new Logger('OrderCancelledListener');

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketUpdatedPublisher: TicketUpdatedPublisher,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    logger.log(`Order cancelled data: ${JSON.stringify(data)}`);

    const { id, ticket } = data;

    const ticketDocument = await this.ticketsRepository.findById(ticket.id);

    if (!ticketDocument) {
      logger.warn(`Ticket with id ${id} not found`);
      return;
    }

    const ticketUpdated = await this.ticketsRepository.update(ticket.id, {
      orderId: undefined,
    });

    logger.log(`Ticket updated: ${JSON.stringify(ticketUpdated)}`);

    await this.ticketUpdatedPublisher.publish(
      Ticket.fromDocument(ticketUpdated),
    );

    msg.ack();
  }
}
