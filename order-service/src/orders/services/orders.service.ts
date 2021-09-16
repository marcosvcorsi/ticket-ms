import { OrderStatus } from '@mvctickets/common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderCancelledPublisher } from '../events/order-cancelled-publisher';
import { OrderCreatedPublisher } from '../events/order-created-publisher';
import { Order } from '../models/order.model';
import { OrdersRepository } from '../repositories/orders.repository';
import { TicketsService } from './tickets.service';

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

export type CreateOrderParams = {
  ticketId: string;
  userId: string;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly ticketsService: TicketsService,
    private readonly orderCreatedPublisher: OrderCreatedPublisher,
    private readonly orderCancelledPublisher: OrderCancelledPublisher,
  ) {}

  async create(params: CreateOrderParams): Promise<Order> {
    const { ticketId, userId } = params;

    const ticket = await this.ticketsService.findById(ticketId);

    const isTicketAvailable = await this.ticketsService.isTicketAvailable(
      ticket,
    );

    if (!isTicketAvailable) {
      throw new BadRequestException('Ticket is already reserved');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const orderDocument = await this.ordersRepository.create({
      userId,
      ticket,
      expiresAt,
      status: OrderStatus.Created,
    });

    const order = Order.fromDocument(orderDocument);

    await this.orderCreatedPublisher.publish({
      ...order,
      expiresAt: order.expiresAt.toISOString(),
    });

    return order;
  }

  async findById(id: string, userId: string): Promise<Order> {
    const orderDocument = await this.ordersRepository.findById(id);

    if (!orderDocument) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (orderDocument.userId !== userId) {
      throw new ForbiddenException('User cannot access this resource');
    }

    return Order.fromDocument(orderDocument);
  }

  async find(userId: string): Promise<Order[]> {
    const orderDocuments = await this.ordersRepository.findByUser(userId);

    return orderDocuments.map(Order.fromDocument);
  }

  async cancel(id: string, userId: string): Promise<void> {
    const order = await this.findById(id, userId);

    await this.ordersRepository.updateStatus(id, OrderStatus.Cancelled);

    await this.orderCancelledPublisher.publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });
  }
}
