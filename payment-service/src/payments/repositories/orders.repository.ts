import { OrderStatus } from '@mvctickets/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: Order & { _id?: string }): Promise<OrderDocument> {
    const order = new this.orderModel(orderData);

    return order.save();
  }

  async findByIdAndVersion(
    id: string,
    version: number,
  ): Promise<OrderDocument> {
    return this.orderModel.findOne({ _id: id, version: version - 1 });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    return this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
