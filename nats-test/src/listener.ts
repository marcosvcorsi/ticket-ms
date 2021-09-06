import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './events/tickets/ticket-created-listener';

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

client.on('connect', () => {
  console.log('listener connected to nats');

  client.on('close', () => {
    console.log('listener connection closed');
    process.exit();
  });

  process.on('SIGINT', () => {
    client.close();
  });

  process.on('SIGTERM', () => {
    client.close();
  });

  // const options = client.subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   .setDurableName('service')

  // const subscription = client.subscribe('ticket:created', options);

  // subscription.on('message', (msg: Message) => {
  //   console.log('listener received a message', msg.getData());

  //   msg.ack();
  // })

  const listener = new TicketCreatedListener(client);
  listener.listen();
})


