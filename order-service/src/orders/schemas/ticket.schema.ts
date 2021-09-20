import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema()
export class Ticket {
  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop()
  orderId?: string;

  @Prop()
  version?: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
