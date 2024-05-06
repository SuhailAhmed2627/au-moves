import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import DriverLogin from "./pages/DriverLogin";
import AdminLogin from "./pages/AdminLogin";
import SecretaryLogin from "./pages/SecretaryLogin";
import Home from "./pages/Home";
import DriverHome from "./pages/DriverHome";
import AdminHome from "./pages/AdminHome";
import SecretaryHome from "./pages/SecretaryHome";
import BookRides from "./pages/BookRides";
import StudentList from "./pages/StudentList";
import Account from "./pages/Account";
import DriverAccount from "./pages/DriverAccount";
import Billing from "./pages/Billing";
import Events from "./pages/Events";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import DriverProfile from "./pages/DriverProfile";
import Background from "./components/Background";
import LandingPage from "./pages/LandingPage";
import AdminAccount from "./pages/AdminAccount";
import SecretaryAccount from "./pages/SecretaryAccount";
import AdminEvents from "./pages/AdminEvents";
import AdminEventApproval from "./pages/AdminEventApproval";

const App = () => {
  return (
    <>
      <Background />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/driverLogin" element={<DriverLogin />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/secretaryLogin" element={<SecretaryLogin />} />
        <Route path="/driverHome" element={<DriverHome />}>
          {/* Child Routes */}
          <Route
            path="/driverHome"
            element={<Navigate to="/driverHome/driverAccount" replace />}
          />
          <Route path="/driverHome/driverAccount" element={<DriverAccount />} />
          <Route path="/driverHome/studentList" element={<StudentList />} />
          <Route path="/driverHome/map" element={<Map />} />
          <Route path="/driverHome/driverProfile" element={<DriverProfile />} />
        </Route>
        <Route path="/home" element={<Home />}>
          {/* Child Routes */}
          <Route
            path="/home"
            element={<Navigate to="/home/account" replace />}
          />
          <Route path="/home/account" element={<Account />} />
          <Route path="/home/bookRides" element={<BookRides />} />
          <Route path="/home/billing" element={<Billing />} />
          <Route path="/home/events" element={<Events />} />
          <Route path="/home/profile" element={<Profile />} />
        </Route>
        <Route path="/adminHome" element={<AdminHome />}>
          <Route
            path="/adminHome"
            element={<Navigate to="/adminHome/adminAccount" replace />}
          />
          <Route path="/adminHome/adminAccount" element={<AdminAccount />} />
          <Route path="/adminHome/adminEvents" element={<AdminEvents />} />
          <Route
            path="/adminHome/adminEventApproval/:eventId"
            element={<AdminEventApproval />}
          />
        </Route>
        <Route path="/secretaryHome" element={<SecretaryHome />}>
          <Route
            path="/secretaryHome"
            element={<Navigate to="/secretaryHome/secretaryAccount" replace />}
          />
          <Route
            path="/secretaryHome/secretaryAccount"
            element={<SecretaryAccount />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
