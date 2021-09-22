import { ExpirationCompleteEvent, Publisher, Subjects } from "@mvctickets/common";
import { QUEUE_GROUP_NAME } from "../index";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  readonly queueGroupName = QUEUE_GROUP_NAME;
}