import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async findById(id: string): Promise<TicketDocument> {
    return this.ticketModel.findById(id);
  }

  async create(ticketData: Ticket): Promise<TicketDocument> {
    const ticket = new this.ticketModel(ticketData);

    return ticket.save();
  }
}
