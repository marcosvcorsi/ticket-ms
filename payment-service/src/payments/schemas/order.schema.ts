import { OrderStatus } from '@mvctickets/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop()
  userId: string;

  @Prop()
  status: OrderStatus;

  @Prop()
  price: number;

  @Prop()
  version?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
