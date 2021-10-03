
import Router from "next/router";
import Errors from "../../components/Errors";
import useRequest from "../../hooks/use-request"

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest();

  const handlePurchase = async () => {
    const data = await doRequest({
      url: '/api/orders',
      method: 'post',
      body: {
        ticketId: ticket.id,
      }
    });

    if (data) {
      Router.push("/orders/[orderId]", `/orders/${data.id}`);
    }
  }

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>

      <Errors errors={errors} />
      <button className="btn btn-primary" onClick={handlePurchase}>Purchase</button>
    </div>
  )
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  return client.get(`/api/tickets/${ticketId}`)
    .then(({ data }) => ({ ticket: data }))
    .catch(error => {
      console.error(error);

      return { ticket: null };
    });
};

export default TicketShow;