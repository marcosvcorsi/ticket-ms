import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';
import { Order } from './order.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Owner' })
  order: Order;

  @Prop()
  chargeId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
