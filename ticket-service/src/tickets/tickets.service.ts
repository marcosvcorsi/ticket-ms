import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { Ticket } from './models/ticket.model';
import { TicketsRepository } from './repositories/tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticketDocument = await this.ticketsRepository.create(createTicketDto);

    return Ticket.fromDocument(ticketDocument);
  }
}
