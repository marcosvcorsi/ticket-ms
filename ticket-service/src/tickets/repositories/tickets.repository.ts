import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { CreateTicketParams } from '../tickets.service';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async create(createTicketDto: CreateTicketParams): Promise<TicketDocument> {
    const createdTicket = new this.ticketModel(createTicketDto);

    return createdTicket.save();
  }
}
