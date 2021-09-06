import { Message } from "node-nats-streaming";
import { Listener } from "../listener";
import { Subjects } from "../subjects";
import { TicketCreatedEvent, TicketEventData } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = 'service';

  onMessage(data: TicketEventData, msg: Message): void {
    console.log('Event data: ', data);
    msg.ack();
  }
}