import Router from "next/router";
import { useState } from "react"
import useRequest from "../../hooks/use-request";

export default function SingIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { doRequest, errors } = useRequest();
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = await doRequest({
      url: '/api/users/sign-in',
      method: 'post',
      body: {
        email,
        password
      }
    })

    if (data) {
      Router.push('/');
    }
  }

  return (
    <form className="sign-up-form" onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      
      <div className="form-group">
        <label>Email:</label>
        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      
      {errors?.length > 0 && (
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
          {errors.map(message => <li key="message">{message}</li>)}
          </ul>

        </div>
      )}

      <button className="btn btn-primary" type="submit">Sign In</button>
    </form>
  )
}