import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const isUserSignedIn = !!localStorage.getItem("token");
    if (!isUserSignedIn) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
