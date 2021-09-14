import { OrderStatus } from '@mvctickets/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repositories/orders.repository';
import { TicketsRepository } from '../repositories/tickets.repository';
import { TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async findById(id: string): Promise<TicketDocument> {
    const ticket = await this.ticketsRepository.findById(id);

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return ticket;
  }

  async isTicketAvailable(ticket: TicketDocument): Promise<boolean> {
    const existingOrder = await this.ordersRepository.findByTicketAndStatuses(
      ticket,
      [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    );

    return !!existingOrder;
  }
}
