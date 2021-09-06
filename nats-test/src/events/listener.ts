import { Stan, Message } from "node-nats-streaming";
import { Subjects } from "./subjects";

export type ListenerEventType = {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends ListenerEventType> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client.subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    console.log(`Listening to ${this.subject} / ${this.queueGroupName}`);

    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      );

      const parseData = this.parseMessage(msg);

      this.onMessage(parseData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string' 
      ? JSON.parse(data) 
      : JSON.parse(data.toString('utf8'));
  }

  abstract onMessage(data: T['data'], msg: Message): void;
}
