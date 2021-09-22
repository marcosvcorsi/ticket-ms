import Queue from 'bull';

type OrderExpirationPayload = {
  orderId: string;
}

const expirationQueue = new Queue<OrderExpirationPayload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  }
});

expirationQueue.process(async (job) => {
  console.log(`Expiring order ${job.data.orderId}`);
})

export { expirationQueue };
