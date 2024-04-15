import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getDriverStatusText = ({ available, alloted }) => {
  if (available) {
    return "You have not started the ride";
  } else {
    return "You have started the ride, Click the Link to open the map";
  }
};

function Map() {
  const [driverStatus, setDriverStatus] = useState(false);
  const [link, setLink] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/driver/status", {
        //sending request from frontend to backend
        headers: { authorization: token }, //setting headers with token
      });

      const data = result.data; //json from server
      setDriverStatus(data);
    };

    fetchFromServer();
  }, []);

  useEffect(() => {
    if (!driverStatus || driverStatus.available) {
      return;
    }
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/driver/link", {
        headers: { authorization: token },
      });

      const data = result.data;
      setLink(data.link);
    };

    fetchFromServer();
  }, [driverStatus]);

  return (
    <div>
      <h1>Driver Account</h1>
      {!driverStatus && <h2>Loading...</h2>}
      {driverStatus && (
        <div>
          <h2>{getDriverStatusText(driverStatus)}</h2>
          {link && (
            <a href={link} target="_blank">
              Open Map
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default Map;
