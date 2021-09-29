import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { OrdersRepository } from '../../repositories/orders.repository';
import { QUEUE_GROUP_NAME } from '..';

const logger = new Logger('OrderCancelledListener');

@Injectable()
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ordersRepository: OrdersRepository,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    logger.log(`Order cancelled data: ${JSON.stringify(data)}`);

    const { id, version } = data;

    const order = await this.ordersRepository.findByIdAndVersion(id, version);

    if (!order) {
      logger.warn(`Order with id ${id} and version ${version} not found`);
      return;
    }

    await this.ordersRepository.updateStatus(id, OrderStatus.Cancelled);

    msg.ack();
  }
}
