import { useState } from "react"
import Router from "next/router";
import Errors from "../../components/Errors";
import useRequest from "../../hooks/use-request"

export default function NewTicket() {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")

  const { doRequest, errors } = useRequest();

  const handlePriceBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = await doRequest({
      url: '/api/tickets',
      method: 'post',
      body: {
        title,
        price: Number(price),
      }
    })

    if(data) {
      Router.push("/");
    }
  }

  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input 
            className="form-control" 
            type="text" 
            name="title" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input 
            className="form-control" 
            type="text" 
            name="price"
            value={price}
            onBlur={handlePriceBlur}
            onChange={e => setPrice(e.target.value)} 
          />
        </div>
        <Errors errors={errors} />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}