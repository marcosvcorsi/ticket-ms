import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { Ticket } from './models/ticket.model';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketDocument } from './schemas/ticket.schema';

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
    const ticketDocument = await this.getTicketDocument(id);

    return Ticket.fromDocument(ticketDocument);
  }

  async find(): Promise<Ticket[]> {
    const ticketDocuments = await this.ticketsRepository.find();

    return ticketDocuments.map(Ticket.fromDocument);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    await this.getTicketDocument(id);

    const ticketDocument = await this.ticketsRepository.update(
      id,
      updateTicketDto,
    );

    return Ticket.fromDocument(ticketDocument);
  }

  private async getTicketDocument(id: string): Promise<TicketDocument> {
    const ticketDocument = await this.ticketsRepository.findById(id);

    if (!ticketDocument) {
      throw new NotFoundException('Ticket not found');
    }

    return ticketDocument;
  }
}
