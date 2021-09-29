import { Listener, OrderCreatedEvent, Subjects } from "@mvctickets/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { QUEUE_GROUP_NAME } from "../index";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = QUEUE_GROUP_NAME;
  
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    console.log("Order created data: ", JSON.stringify(data));
    
    const orderId = data.id;
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log("Waiting this many milliseconds to process the job: ", delay);

    await expirationQueue.add({ orderId }, { delay });

    msg.ack();
  }
}