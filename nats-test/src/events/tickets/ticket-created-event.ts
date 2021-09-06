import { Subjects } from "../subjects";

export type TicketEventData = {
  id: string;
  title: string;
  price: number;
}

export type TicketCreatedEvent = {
  subject: Subjects.TicketCreated;
  data: TicketEventData;
}