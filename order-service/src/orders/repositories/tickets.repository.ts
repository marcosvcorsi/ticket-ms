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

  async create(ticketData: Ticket & { _id?: string }): Promise<TicketDocument> {
    const ticket = new this.ticketModel(ticketData);

    return ticket.save();
  }

  async update(id: string, data: Ticket): Promise<void> {
    await this.ticketModel.updateOne({ _id: id }, data);
  }
}
