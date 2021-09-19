import { OrderStatus } from '@mvctickets/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
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

  @Prop({ type: mongooseSchema.Types.ObjectId, ref: 'Ticket' })
  ticket: TicketDocument;

  @Prop()
  version?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
