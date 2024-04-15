import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
function Profile() {
  const navigate = useNavigate();
  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const [profile, setProfile] = useState(null); //profile is initially null, set after fetching from server

  //after rendering for the first time, the function in useEffect will take place
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/profile", {
        //sending request from frontend to backend
        headers: { authorization: token }, //setting headers with token
      });

      const data = result.data; //json from server
      setProfile(data);
    };

    fetchFromServer();
  }, []);

  if (profile === null) {
    return <div>Loading...</div>; //initially shown during fetching
  }
  const name = profile.names;
  const username = profile.username;
  const emirate = profile.emirate;
  const pno = profile.phone_number;

  return (
    <div>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="bi bi-person"
          viewBox="0 0 16 16"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{name}</h5>
          <h6 className="card-subtitle mb-2 text-muted">
            {username}@ajmanuni.ac.ae
          </h6>
          <p className="card-text">
            Student ID: {username} <br />
            Emirate: {emirate} <br />
            TEL: +971{pno}{" "}
          </p>
        </div>
      </div>
      <div>
        <button onClick={logoutButton} className="logout">
          SIGN OUT
        </button>
      </div>
    </div>
  );
}

export default Profile;
