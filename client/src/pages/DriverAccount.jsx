import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getDriverStatusText = ({ available, alloted, events }) => {
  if (available && !alloted) {
    return "You are available for a ride";
  }

  if (available && alloted) {
    return "You have been alloted a ride, Start the ride at the specified time";
  }

  if (!available && alloted) {
    if (events && events.length) {
      return "You have been alloted an event";
    }
    return "You have started the ride, Proceed to pick up the students";
  }

  return "You are not available for a ride";
};

function DriverAccount() {
  const [driverStatus, setDriverStatus] = useState(false);
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

  const startRide = async () => {
    const token = localStorage.getItem("token");

    const result = await axios.get("http://localhost:3000/driver/startRide", {
      headers: { Authorization: token },
    });

    const data = result.data;
    setDriverStatus({ available: data.available, alloted: data.alloted });
  };

  const completeEvent = async () => {
    const token = localStorage.getItem("token");

    const result = await axios.get(
      "http://localhost:3000/driver/completeEvent",
      {
        headers: { Authorization: token },
      },
    );

    if (result.status === 200) {
      window.location.reload();
    }
  };

  const endRide = async () => {
    const token = localStorage.getItem("token");

    const result = await axios.get("http://localhost:3000/driver/endRide", {
      headers: { Authorization: token },
    });

    const data = result.data;
    setDriverStatus({ available: data.available, alloted: data.alloted });
  };

  return (
    <div>
      <h1>Driver Account</h1>
      {!driverStatus && <h2>Loading...</h2>}
      {driverStatus && (
        <div>
          <h2>{getDriverStatusText(driverStatus)}</h2>
          {driverStatus.alloted && (
            <>
              {!driverStatus.available &&
                (driverStatus.events ? (
                  <>
                    <h3>
                      Depart at:{" "}
                      {new Date(driverStatus.events[0].time).toLocaleString()}
                    </h3>
                    <button onClick={completeEvent}>Complete Event</button>
                  </>
                ) : (
                  <>
                    <h3>
                      Depart at:{" "}
                      {new Date(driverStatus.departureTime).toLocaleString()}
                    </h3>
                    <button onClick={startRide}>Start Ride</button>
                  </>
                ))}

              {!driverStatus.available && !driverStatus.events && (
                <>
                  <button onClick={endRide}>End Ride</button>
                  <button onClick={() => navigate("/driverHome/studentList")}>
                    View Students List
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DriverAccount;
