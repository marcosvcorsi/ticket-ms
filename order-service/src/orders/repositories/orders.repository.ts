import { OrderStatus } from '@mvctickets/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findByTicketAndStatuses(
    ticket: TicketDocument,
    statuses: OrderStatus[],
  ): Promise<OrderDocument> {
    return this.orderModel.findOne({
      ticket,
      status: {
        $in: statuses,
      },
    });
  }

  async create(orderData: Order): Promise<OrderDocument> {
    const order = new this.orderModel(orderData);

    return order.save();
  }

  async findById(id: string): Promise<OrderDocument> {
    return this.orderModel.findById(id).populate('ticket');
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({
        userId,
      })
      .populate('ticket');
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    return this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
