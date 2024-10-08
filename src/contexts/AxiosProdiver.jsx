import { createContext, useContext } from 'react';
import useAxios from '../api/useAxios';

const AxiosContext = createContext();

export const AxiosProvider = ({ children }) => {
  const axiosInstance = useAxios();  // useAxios can now safely use useNavigate since this is inside Router

  return (
    <AxiosContext.Provider value={axiosInstance}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxiosInstance = () => {
  return useContext(AxiosContext);
};
