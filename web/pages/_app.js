import 'bootstrap/dist/css/bootstrap.css';
import { buildClient } from '../api/build-client';
import Header from '../components/Header';

const MyApp = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </>    
  )

}

MyApp.getInitialProps = async (appContext) => {
  const { ctx } = appContext;

  const client = buildClient(ctx)

  let currentUser = null;

  try {
    const { data } = await client.get('/api/users/me');

    currentUser = data;
  } catch {}

  const pageProps = await appContext.Component?.getInitialProps(ctx) || {};

  return { pageProps, currentUser: null };
}

export default MyApp
