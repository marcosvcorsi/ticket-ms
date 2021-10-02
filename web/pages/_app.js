import 'bootstrap/dist/css/bootstrap.css';
import { buildClient } from '../api/build-client';
import Header from '../components/Header';

const MyApp = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
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
  } catch (error){
    console.error(error);
  }

  let pageProps = {};

  if(appContext.Component?.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, currentUser);
  }

  return { pageProps, currentUser };
}

export default MyApp
