import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from "next/router";
import Errors from "../../components/Errors";
import useRequest from "../../hooks/use-request"

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest();

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();

      setTimeLeft(Math.round(msLeft / 1000));
    }

    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [order]);

  const handlePaymentToken = async ({ id }) => {
    const data = await doRequest({
      url: '/api/payments',
      method: 'post',
      body: {
        orderId: order.id,
        token: id
      }
    })

    if (data) {
      Router.push("/orders");
    }
  }

  if(timeLeft < 0) {
    return <div>Order expired.</div>
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds.

      <Errors errors={errors} />

      <StripeCheckout 
        token={handlePaymentToken}
        stripeKey="pk_test_51JerLBCiH8NnB77RUGXuktg2NuizqcTrX5xOqtkiULPQl4Dw5SlpXpj2xwLrNz6BvedDIjnPqnf6sSzBSUMFM0ui00ZpCpBY25"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
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