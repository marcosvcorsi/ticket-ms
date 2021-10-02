import { useState } from "react"

export default function NewTicket() {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")

  const handlePriceBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  }

  return (
    <div>
      <h1>Create a Ticket</h1>
      <form>
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

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}