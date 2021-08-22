import Router from "next/router";
import { useEffect } from "react"
import useRequest from '../../hooks/use-request';

export default function SignOut () {
  const { doRequest } = useRequest();
  
  useEffect(() => {
    doRequest({
      url: '/api/users/sign-out',
      method: 'post',
      body: {},
    }).then(() => Router.push('/'))
      .catch(console.error);
  }, []);
  
  return <div>Signing you out...</div>
}