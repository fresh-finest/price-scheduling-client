import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from "./components/shared/Header";
import Calendar from './pages/Calendar';
import List from './pages/List';
// import Login from './pages/Login';
import { PriceScheduleProvider } from './contexts/PriceScheduleContext';

function App() {
  return (
    <PriceScheduleProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Calendar/>}/>
          <Route path="/list" element={<List />} />
          <Route path="/calendar" element={<Calendar />} />
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </Router>
    </PriceScheduleProvider>
  );
}

export default App;
