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
      setErrors(error.response.data.message);
    }
  }

  return { doRequest, errors };
}