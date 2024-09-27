import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAxios = () => {
  const navigate = useNavigate();  // This hook must be inside a function component or custom hook
  
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,  // Include cookies in the request
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Log the user out
        navigate('/login');  // Redirect to login page
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
