import { useEffect, useState } from "react";
import axios from "axios";
import "./Account.css";

function SecretaryAccount() {
  const [profile, setProfile] = useState(null); //profile is initially null, set after fetching from server

  //after rendering for the first time, the function in useEffect will take place
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get(
        "http://localhost:3000/secretary/profile",
        {
          //sending request from frontend to backend
          headers: { authorization: token }, //setting headers with token
        },
      );

      const data = result.data; //json from server
      setProfile(data);
    };

    fetchFromServer();
  }, []);

  return <div>Hi Secretary</div>;
}

export default SecretaryAccount;
