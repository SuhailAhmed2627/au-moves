import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getDriverStatusText = ({ available, alloted }) => {
  if (!alloted) {
    return "No ride alloted";
  }

  if (available) {
    return "You have been alloted a ride. Go to Home page to start the ride";
  }

  if (!available) {
    return "You have started the ride, Proceed to pick up the students";
  }
};

function StudentList() {
  const [driverStatus, setDriverStatus] = useState(false);
  const [ridesData, setRidesData] = useState(false);
  const [toUni, setToUni] = useState(true);
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
    if (!driverStatus) {
      return;
    }
    if (!driverStatus.alloted) {
      return;
    }
    if (driverStatus.available) {
      return;
    }

    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/driver/ridesData", {
        headers: { authorization: token },
      });

      const data = result.data;
      setRidesData(data.ridesData);
      setToUni(data.toUni);
    };

    fetchFromServer();
  }, [driverStatus]);

  const pickUpStudent = async (rideId) => {
    const token = localStorage.getItem("token");

    const result = await axios.post(
      "http://localhost:3000/driver/pickUpStudent",
      {
        rideId,
      },
      {
        headers: { Authorization: token },
      },
    );

    const data = result.data;
    setRidesData(data.ridesData);
  };

  return (
    <div>
      <h1>Driver Account</h1>
      {!driverStatus && <h2>Loading...</h2>}
      {driverStatus && (
        <div>
          <h2>{getDriverStatusText(driverStatus)}</h2>
          {ridesData && (
            <div>
              <h3>Students to be {toUni ? "picked up" : "dropped off"}</h3>
              {ridesData.map((ride) => (
                <div key={ride._id}>
                  <h4>{ride.bookedBy.names}</h4>
                  <p>{ride.bookedBy.username}</p>
                  <p>{ride.bookedBy.phone_number}</p>
                  <p>{ride.bookedBy.latitude}</p>
                  <p>{ride.bookedBy.longitude}</p>
                  <div>
                    <input
                      type="checkbox"
                      id={ride._id + "checkbox"}
                      name={ride._id + "checkbox"}
                      disabled={ride.pickedUpOrDropped}
                      onClick={() => pickUpStudent(ride._id)}
                      checked={ride.pickedUpOrDropped}
                    />
                    <label for={ride._id + "checkbox"}>
                      {toUni ? "Pick up" : "Drop off"}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentList;
