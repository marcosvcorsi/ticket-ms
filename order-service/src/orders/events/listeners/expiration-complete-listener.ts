import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { OrdersRepository } from '../../repositories/orders.repository';
import { QUEUE_GROUP_NAME } from '..';
import { OrderCancelledPublisher } from '../publishers';

const logger = new Logger('ExpirationCompleteListener');

@Injectable()
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderCancelledPublisher: OrderCancelledPublisher,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    logger.log(`Expiration complete data: ${JSON.stringify(data)}`);

    const { orderId } = data;

    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      logger.warn(`Order with id ${orderId} not found`);
      return;
    }

    if (order.status === OrderStatus.Complete) {
      logger.warn(`Order with id ${orderId} is completed`);
      msg.ack();
      return;
    }

    const orderUpdated = await this.ordersRepository.updateStatus(
      orderId,
      OrderStatus.Cancelled,
    );

    await this.orderCancelledPublisher.publish({
      id: orderId,
      ticket: {
        id: order.ticket.id,
      },
      version: orderUpdated.version,
    });

    msg.ack();
  }
}
