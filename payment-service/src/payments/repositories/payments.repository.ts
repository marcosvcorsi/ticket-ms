import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(data: Payment): Promise<PaymentDocument> {
    const payment = new this.paymentModel(data);

    return payment.save();
  }
}
