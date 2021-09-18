import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export type TicketDocument = Ticket & Document;

@Schema()
export class Ticket {
  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop()
  userId: string;

  @Prop()
  version: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket)
  .set('versionKey', 'version')
  .plugin(updateIfCurrentPlugin);
