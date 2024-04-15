import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DriverNavbar from "../components/DriverNavbar";
function DriverHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const isUserSignedIn = !!localStorage.getItem("token");
    if (!isUserSignedIn) {
      navigate("/driverLogin");
    }
  }, [navigate]);

  return (
    <div>
      <DriverNavbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default DriverHome;
