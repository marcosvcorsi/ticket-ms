import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { Ticket } from './models/ticket.model';
import { TicketsRepository } from './repositories/tickets.repository';

export type CreateTicketParams = CreateTicketDto & {
  userId: string;
};

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async create(createTicketDto: CreateTicketParams): Promise<Ticket> {
    const ticketDocument = await this.ticketsRepository.create(createTicketDto);

    return Ticket.fromDocument(ticketDocument);
  }

  async findById(id: string): Promise<Ticket> {
    const ticketDocument = await this.ticketsRepository.findById(id);

    if (!ticketDocument) {
      throw new NotFoundException('Ticket not found');
    }

    return Ticket.fromDocument(ticketDocument);
  }
}
