import { natsClient } from "@mvctickets/common";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsClient.connect({
      clientId: process.env.NATS_CLIENT_ID,
      clusterId: process.env.NATS_CLUSTER_ID,
      url: process.env.NATS_URL
    })

    natsClient.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    
    process.on('SIGINT', () => natsClient.client.close());
    process.on('SIGTERM', () => natsClient.client.close());

    const orderCreatedListener = new OrderCreatedListener(natsClient.client);
    orderCreatedListener.listen();
  } catch(error) {
    console.error(error); 
  }
};

start();