import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Publisher connected to NATS');
  
  process.on('SIGINT', () => {
    client.close();
  });

  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  });

  client.publish('ticket:created', data, () => {
    console.log('Event published');
  });
});