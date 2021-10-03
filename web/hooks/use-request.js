import axios from 'axios';
import { useState } from 'react';

export default function useRequest() {
  const [errors, setErrors] = useState([]);

  const doRequest = async ({ url, method, body }) => {
    setErrors([]);

    try {
      const { data } = await axios({
        url,
        method,
        data: body,
      });

      return data;
    } catch (error) {
      const { message } = error.response.data;

      if(Array.isArray(message)) {
        setErrors(message);
      } else {
        setErrors([message]);
      }
    }
  }

  return { doRequest, errors };
}