import { OrderStatus } from '@mvctickets/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TicketDocument } from './ticket.schema';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop()
  userId: string;

  @Prop()
  status: OrderStatus;

  @Prop()
  expiresAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' })
  ticket: TicketDocument;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
