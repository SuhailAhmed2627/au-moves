import { useEffect, useState } from "react";
import axios from "axios";
import "./Account.css";

function Account() {
  const [profile, setProfile] = useState(null); //profile is initially null, set after fetching from server
  const [rides, setRides] = useState([]);
  const [showUpcoming, setShowUpcoming] = useState(true);
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

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get("http://localhost:3000/ride/getAll", {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
        });

        console.log("Fetched rides:", response.data);

        setRides(response.data);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      }
    };

    fetchRides();
  }, []);

  const cancelRide = async (rideId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/ride/delete",
        { rideId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ rideId }),
        },
      );

      console.log(response.data); // "Ride deleted successfully"

      setRides(rides.filter((ride) => ride._id !== rideId));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (profile === null) {
    return <div>Loading...</div>; //initially shown during fetching
  }

  const name = profile.names;
  return (
    <div>
      <h1 className="name">Hello, {name}!</h1>
      <div className="switch-field-rides">
        <input
          type="radio"
          id="radio-one"
          name="switch-one"
          value="upcoming"
          checked={showUpcoming === true}
          onChange={() => setShowUpcoming(true)}
        />
        <label htmlFor="radio-one">Upcoming Rides</label>

        <input
          type="radio"
          id="radio-two"
          name="switch-one"
          value="past"
          checked={showUpcoming === false}
          onChange={() => setShowUpcoming(false)}
        />
        <label htmlFor="radio-two">Past Rides</label>
      </div>
      <div className="ridesContainer">
        {rides && rides.length > 0 ? (
          rides.map((ride) =>
            (
              showUpcoming ? !ride.pickedUpOrDropped : ride.pickedUpOrDropped
            ) ? (
              <div className="ridesDisplay" key={ride._id}>
                <p>
                  <strong>Time:</strong> {new Date(ride.time).toLocaleString()}
                </p>
                <p>
                  <strong>To University:</strong> {ride.toUni ? "Yes" : "No"}
                </p>

                <p>
                  <strong>
                    {ride.toUni ? "Pickup Time" : "Drop off time"}:
                  </strong>{" "}
                  {new Date(ride.pickUpOrDropTime).toLocaleString()}
                </p>

                <p>
                  <strong>Driver: </strong>{" "}
                  {ride.driver ? ride.driver.name : "No driver yet"}
                </p>
                {showUpcoming && (
                  <button
                    className="cancelButton"
                    onClick={() => cancelRide(ride._id)}
                  >
                    Cancel Ride
                  </button>
                )}
              </div>
            ) : null,
          )
        ) : (
          <p>No rides available</p>
        )}
      </div>
    </div>
  );
}

export default Account;
