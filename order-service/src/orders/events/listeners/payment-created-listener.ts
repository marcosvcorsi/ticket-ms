import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { OrdersRepository } from '../../repositories/orders.repository';
import { QUEUE_GROUP_NAME } from '..';

const logger = new Logger('PaymentCreatedListener');

@Injectable()
export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ordersRepository: OrdersRepository,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    logger.log(`Payment created data: ${JSON.stringify(data)}`);

    const {
      order: { id },
    } = data;

    const order = await this.ordersRepository.findById(id);

    if (!order) {
      logger.warn(`Order with id ${id} not found`);
      return;
    }

    const updatedOrder = await this.ordersRepository.updateStatus(
      id,
      OrderStatus.Complete,
    );

    logger.log(`Order updated: ${JSON.stringify(updatedOrder)}`);

    msg.ack();
  }
}
