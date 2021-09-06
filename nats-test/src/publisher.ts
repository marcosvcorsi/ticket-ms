import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { Publisher } from './events/publisher';
import { TicketCreatedPublisher } from './events/tickets/ticket-created-publisher';

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', async () => {
  console.log('Publisher connected to NATS');
  
  process.on('SIGINT', () => {
    client.close();
  });

  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // client.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });

  const publisher = new TicketCreatedPublisher(client);
  await publisher.publish({
    id: '123',
    title: 'concert',
    price: 20,
  }).catch(console.error);
});