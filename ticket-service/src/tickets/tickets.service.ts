import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { TicketUpdatedPublisher } from './events/ticket-updated-publisher';
import { Ticket } from './models/ticket.model';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketDocument } from './schemas/ticket.schema';

export type CreateTicketParams = CreateTicketDto & {
  userId: string;
};

export type UpdateTicketParams = UpdateTicketDto & {
  userId: string;
};

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketCreatedPublisher: TicketCreatedPublisher,
    private readonly ticketUpdatedPublisher: TicketUpdatedPublisher,
  ) {}

  async create(createTicketDto: CreateTicketParams): Promise<Ticket> {
    const ticketDocument = await this.ticketsRepository.create(createTicketDto);

    const ticket = Ticket.fromDocument(ticketDocument);

    await this.ticketCreatedPublisher.publish(ticket);

    return ticket;
  }

  async findById(id: string): Promise<Ticket> {
    const ticketDocument = await this.getTicketDocument(id);

    const ticket = Ticket.fromDocument(ticketDocument);

    return ticket;
  }

  async find(): Promise<Ticket[]> {
    const ticketDocuments = await this.ticketsRepository.find();

    return ticketDocuments.map(Ticket.fromDocument);
  }

  async update(
    id: string,
    updateTicketParams: UpdateTicketParams,
  ): Promise<Ticket> {
    const existingTicket = await this.getTicketDocument(id);

    if (existingTicket.userId !== updateTicketParams.userId) {
      throw new ForbiddenException('You are not allowed to update this ticket');
    }

    const ticketDocument = await this.ticketsRepository.update(
      id,
      updateTicketParams,
    );

    const ticket = Ticket.fromDocument(ticketDocument);

    await this.ticketUpdatedPublisher.publish(ticket);

    return ticket;
  }

  private async getTicketDocument(id: string): Promise<TicketDocument> {
    const ticketDocument = await this.ticketsRepository.findById(id);

    if (!ticketDocument) {
      throw new NotFoundException('Ticket not found');
    }

    return ticketDocument;
  }
}
