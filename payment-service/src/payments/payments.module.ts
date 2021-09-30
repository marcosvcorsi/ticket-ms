import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import {
  OrderCancelledListener,
  OrderCreatedListener,
} from './events/listeners';
import { natsClient } from '@mvctickets/common';
import { OrdersRepository } from './repositories/orders.repository';
import { StripeGateway } from './gateways/stripe.gateway';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentsRepository } from './repositories/payments.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: async () => {
          const schema = OrderSchema;

          schema.set('versionKey', 'version');
          schema.pre('findOneAndUpdate', function () {
            const update = this.getUpdate() as any;
            if (update.version != null) {
              delete update.version;
            }
            const keys = ['$set', '$setOnInsert'];
            for (const key of keys) {
              if (update[key] != null && update[key].version != null) {
                delete update[key].version;
                if (Object.keys(update[key]).length === 0) {
                  delete update[key];
                }
              }
            }
            update.$inc = update.$inc || {};
            update.$inc.version = 1;
          });
          schema.plugin(updateIfCurrentPlugin);

          return schema;
        },
      },
      {
        name: Payment.name,
        useFactory: async () => {
          const schema = PaymentSchema;

          schema.set('versionKey', 'version');
          schema.pre('findOneAndUpdate', function () {
            const update = this.getUpdate() as any;
            if (update.version != null) {
              delete update.version;
            }
            const keys = ['$set', '$setOnInsert'];
            for (const key of keys) {
              if (update[key] != null && update[key].version != null) {
                delete update[key].version;
                if (Object.keys(update[key]).length === 0) {
                  delete update[key];
                }
              }
            }
            update.$inc = update.$inc || {};
            update.$inc.version = 1;
          });
          schema.plugin(updateIfCurrentPlugin);

          return schema;
        },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    {
      provide: 'NATS_CLIENT',
      useFactory: async () => {
        const client = await natsClient.connect({
          clusterId: process.env.NATS_CLUSTER_ID,
          clientId: process.env.NATS_CLIENT_ID,
          url: process.env.NATS_URL,
        });

        return client;
      },
    },
    StripeGateway,
    OrdersRepository,
    PaymentsRepository,
    PaymentsService,
    OrderCreatedListener,
    OrderCancelledListener,
  ],
})
export class PaymentsModule {}
