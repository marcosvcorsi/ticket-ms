import { OrderStatus } from '@mvctickets/common';
import { OrderDocument } from '../schemas/order.schema';

export class Order {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: {
    id: string;
    title: string;
    price: number;
  };

  static fromDocument(document: OrderDocument): Order {
    return {
      id: document._id,
      userId: document.userId,
      status: document.status,
      expiresAt: document.expiresAt,
      ticket: {
        id: document.ticket._id,
        title: document.ticket.title,
        price: document.ticket.price,
      },
    };
  }
}
