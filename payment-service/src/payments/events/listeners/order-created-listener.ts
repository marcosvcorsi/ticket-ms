import { Listener, OrderCreatedEvent, Subjects } from '@mvctickets/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message, Stan } from 'node-nats-streaming';
import { OrdersRepository } from '../../repositories/orders.repository';
import { QUEUE_GROUP_NAME } from '..';

const logger = new Logger('OrderCreatedListener');

@Injectable()
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;

  constructor(
    @Inject('NATS_CLIENT') client: Stan,
    private readonly ordersRepository: OrdersRepository,
  ) {
    super(client);

    this.listen();
  }

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    logger.log(`Order created data: ${JSON.stringify(data)}`);

    const { id, status, userId, ticket } = data;

    const order = await this.ordersRepository.create({
      _id: id,
      status,
      userId,
      price: ticket.price,
    });

    logger.log(`Order inserted: ${JSON.stringify(order)}`);

    msg.ack();
  }
}
