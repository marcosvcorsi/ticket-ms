import Link from 'next/link';

export const LandingPage = ({ currentUser, tickets }) => {
  return (
    <div>
      <h1>Tickets</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.price}</td>
              <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                  <a>View</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  return client.get('/api/tickets')
    .then(({ data }) => ({ tickets: data }))
    .catch(error => {
      console.error(error);

      return { tickets: [] };
    });
}

export default LandingPage;