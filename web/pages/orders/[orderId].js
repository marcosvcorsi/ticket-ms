import { useEffect, useState } from 'react';

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();

      setTimeLeft(Math.round(msLeft / 1000));
    }

    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [order]);

  if(timeLeft < 0) {
    return <div>Order expired.</div>
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds.
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  return client.get(`/api/orders/${orderId}`)
    .then(({ data }) => ({ order: data }))
    .catch(error => {
      console.error(error);

      return { order: null}
    });
}

export default OrderShow;