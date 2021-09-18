import { TicketDocument } from '../schemas/ticket.schema';

export class Ticket {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;

  static fromDocument(document: TicketDocument): Ticket {
    return {
      id: document._id,
      title: document.title,
      price: document.price,
      userId: document.userId,
      version: document.version,
    };
  }
}
