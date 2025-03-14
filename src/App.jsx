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
import JobTable from "./pages/Job";
import Settings from "./pages/Settings";
import Report from "./components/Report/Report";
import SaleDetails from "./components/Report/SaleDetails";
import ReportDetails from "./components/Report/ReportDetails";
import UpdateSalePrice from "./components/List/UpdateSalePrice";
import Automation from "./components/Automation/Automation";
import { TimeZoneProvider } from "./contexts/TimeZoneContext";
import Products from "./components/Products/Products";
import SaleReport from "./components/Report/SaleReport";

function App() {
  return (
    <TimeZoneProvider>
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
              <Route path="details/:sku" element={<SaleDetails />} />
              <Route path="report/:sku" element={<ReportDetails />} />
              <Route path="/status" element={<JobTable />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/report" element={<Report />} />
              <Route path="/list" element={<List />} />
              <Route path="/product" element={<Products />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/history" element={<History />} />
              <Route path="/sale-price" element={<UpdateSalePrice />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/sale-report" element={<SaleReport />} />
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
    </TimeZoneProvider>
  );
}

export default App;
