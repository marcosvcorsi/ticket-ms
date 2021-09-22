import { natsClient } from '@mvctickets/common';
import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers';

type OrderExpirationPayload = {
  orderId: string;
}

const expirationQueue = new Queue<OrderExpirationPayload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  }
});

expirationQueue.process(async (job) => {
  const { orderId } = job.data;

  console.log(`Expiring order ${orderId}`);

  const expirationCompletePublisher = new ExpirationCompletePublisher(natsClient.client);
  expirationCompletePublisher.publish({ orderId });
})

export { expirationQueue };
