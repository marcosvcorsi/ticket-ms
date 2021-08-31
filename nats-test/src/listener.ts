import nats, { Message } from 'node-nats-streaming';

const client = nats.connect('ticketing', 'abcd', {
  url: 'http://localhost:4222',
})

client.on('connect', () => {
  console.log('listener connected to nats');

  client.on('close', () => {
    console.log('listener connection closed');
  });

  process.on('SIGINT', () => {
    client.close();
  });

  const subscription = client.subscribe('ticket:created');

  subscription.on('message', (msg: Message) => {
    console.log('listener received a message', msg.getData());
  })
})