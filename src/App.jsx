import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Calendar from './pages/Calendar';
import List from './pages/List';
// import Login from './pages/Login';
import { PriceScheduleProvider } from './contexts/PriceScheduleContext';
import Login from './pages/Auth/Login';
import PrivateRoute from './pages/Auth/PrivateRoute';

function App() {
  return (
    <PriceScheduleProvider>
      <Router>
        
        <Routes>
          <Route path="/" element={<Login/>}/>

          <Route path="/list" 
          element={
          <PrivateRoute>
            <List />
          </PrivateRoute>
          } />
          <Route path="/calendar"
           element={
          <PrivateRoute>
             <Calendar />
          </PrivateRoute>
           } />
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </Router>
    </PriceScheduleProvider>
  );
}

export default App;
