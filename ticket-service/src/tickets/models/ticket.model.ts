import { TicketDocument } from '../schemas/ticket.schema';

export class Ticket {
  id: string;
  title: string;
  price: number;

  static fromDocument(document: TicketDocument): Ticket {
    return {
      id: document._id,
      title: document.title,
      price: document.price,
    };
  }
}
