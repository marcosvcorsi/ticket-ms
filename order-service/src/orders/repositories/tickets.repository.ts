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

  async findByIdAndVersion(
    id: string,
    version: number,
  ): Promise<TicketDocument> {
    return this.ticketModel.findOne({ _id: id, version: version - 1 });
  }

  async create(ticketData: Ticket & { _id?: string }): Promise<TicketDocument> {
    const ticket = new this.ticketModel(ticketData);

    return ticket.save();
  }

  async update(
    id: string,
    data: Pick<Ticket, 'title' | 'price'>,
  ): Promise<Ticket> {
    return this.ticketModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
}
