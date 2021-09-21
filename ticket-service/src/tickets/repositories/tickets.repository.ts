import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketsRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async create(data: Ticket): Promise<TicketDocument> {
    const createdTicket = new this.ticketModel(data);

    return createdTicket.save();
  }

  async findById(id: string): Promise<TicketDocument> {
    return this.ticketModel.findById(id);
  }

  async find(): Promise<TicketDocument[]> {
    return this.ticketModel.find();
  }

  async update(id: string, data: Partial<Ticket>): Promise<TicketDocument> {
    return this.ticketModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
}
