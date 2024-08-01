import React from 'react';
import './App.css';
import Header from "./components/shared/Header";
import Calendar from './pages/Calendar';
import { PriceScheduleProvider } from './contexts/PriceScheduleContext';

function App() {
  return (
    <PriceScheduleProvider>
      <Header />
      <Calendar />
    </PriceScheduleProvider>
  );
}

export default App;
