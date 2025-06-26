import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL_LOCAL,
  timeout: 60000,
});

export default apiInstance;
