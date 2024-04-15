import { useState, useEffect } from "react";
import axios from "axios";
import "./Billing.css";
function Billing() {
  const [rides, setRides] = useState([]);
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

  return (
    <div>
      <h1 className="pTitle">Payment</h1>
      <div className="paymentContainer">
        {rides && rides.length > 0 ? (
          rides.map((ride) =>
            ride.completed ? (
              <div className="ridesPaymentDisplay" key={ride._id}>
                <p>
                  <strong>Time: </strong>
                  {new Date(ride.time).toLocaleString()}
                </p>
                <p>
                  <strong>To University: </strong> {ride.toUni ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Completed: </strong>
                  {ride.completed ? "Yes" : "No"}
                </p>
                {ride.toUni && (
                  <p>
                    <strong>Pickup Time:</strong>{" "}
                    {/* Insert pickup time here */}
                  </p>
                )}
                <p>
                  <strong>Driver: </strong>
                  {ride.driver || "No driver assigned yet"}
                </p>
                <button
                  className="payNowButton"
                  onClick={() =>
                    window.open(
                      "https://mysis.ajman.ac.ae/StudentSelfService/ssb/accountSummary#!/accountSummaryTerm",
                      "_blank",
                    )
                  }
                >
                  Pay Now
                </button>
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

export default Billing;
