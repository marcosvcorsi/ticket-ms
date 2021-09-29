import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class StripeGateway {
  private client: Stripe;

  constructor() {
    this.client = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async charge(source: string, amount: number) {
    return this.client.charges.create({
      amount,
      source,
      currency: 'usd',
    });
  }
}
