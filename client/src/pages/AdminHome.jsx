import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
function AdminHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const isUserSignedIn = !!localStorage.getItem("token");
    if (!isUserSignedIn) {
      navigate("/adminLogin");
    }
  }, [navigate]);

  return <Outlet />;
}

export default AdminHome;
