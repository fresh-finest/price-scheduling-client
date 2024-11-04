import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Calendar from "./pages/Calendar";
import List from "./pages/List";
// import Login from './pages/Login';
import { PriceScheduleProvider } from "./contexts/PriceScheduleContext";
import Login from "./pages/Auth/Login";
import PrivateRoute from "./pages/Auth/PrivateRoute";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import ManageUserByAdmin from "./pages/ManageUserByAdmin";
import ResetPassword from "./pages/Auth/ResetPassword";
import SidebarLayout from "./components/layouts/SidebarLayouts";
import { AxiosProvider } from "./contexts/AxiosProdiver";
import Job from "./pages/Job";

function App() {
  return (
    <PriceScheduleProvider>
 
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            element={
              <PrivateRoute>
                <SidebarLayout />
              </PrivateRoute>
            }
          >
          <Route path="/report" element={<Job/>}/>
            <Route path="/list" element={<List />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/history" element={<History />} />
            <Route
              path="/manage"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ManageUserByAdmin />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
    </PriceScheduleProvider>
  );
}

export default App;
