export const LandingPage = ({ currentUser }) => {
  return currentUser ? <h2>You are signed in</h2> : <h2>You are NOT signed in</h2>
}

LandingPage.getInitialProps = async () => {
  return {}
}

export default LandingPage;