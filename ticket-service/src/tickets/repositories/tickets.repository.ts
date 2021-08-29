import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<TicketDocument> {
    const createdTicket = new this.ticketModel(createTicketDto);

    return createdTicket.save();
  }
}
