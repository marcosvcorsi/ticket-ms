const OrderList = ({ orders }) => {
  return (
    <ul>
      {orders.map(order => (
        <li key={order.id}>
          {order.ticket.title} - {order.status}
        </li>
      ))}
    </ul>
  )
}

OrderList.getInitialProps = async (_, client) => {
  return client.get('/api/orders')
    .then(({ data }) => ({ orders: data }))
    .catch(error => {
      console.error(error);

      return { orders: [] }
    })
}

export default OrderList;