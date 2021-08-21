export default function Errors({ errors }) {
  return  (
    <>
      {errors?.length > 0 && (
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          
          <ul className="my-0">
            {errors.map(message => <li key="message">{message}</li>)}
          </ul>
        </div>
      )}
    </>
  )
}