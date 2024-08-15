import "bootstrap/dist/css/bootstrap.min.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './index.css';

import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>  
        <App />
      </React.StrictMode>
    </QueryClientProvider>
  </Provider>
);
