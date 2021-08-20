import { useState } from "react"

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      
      <div className="form-group">
        <label>Email:</label>
        <input type="text" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
      </div>

      <button className="btn btn-primary" type="submit">Sign Up</button>
    </form>
  )
}