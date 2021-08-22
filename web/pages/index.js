import { buildClient } from "../api/build-client";

export const LandingPage = ({ currentUser }) => {
  return currentUser ? <h2>You are signed in</h2> : <h2>You are NOT signed in</h2>
}

LandingPage.getInitialProps = async ({ req }) => {
  try {
    const client = buildClient({ req })

    const { data } = await client.get('/api/users/me');

    return { currentUser: data };
  } catch (error) {
    console.error(error);
    return { currentUser: null };
  }
}

export default LandingPage;