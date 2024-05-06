import { useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";

const AdminEventApproval = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [freeDrivers, setFreeDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.post(
        `http://localhost:3000/event/getEvent`,
        {
          eventId,
        },
        {
          headers: { authorization: token },
        },
      );

      const data = result.data;
      setEvent(data);
    };

    fetchFromServer();
  }, [eventId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/driver/getFree", {
        headers: { authorization: token },
      });

      const data = result.data;
      setFreeDrivers(data);
    };

    fetchFromServer();
  }, [event]);

  const approveEvent = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    if (driverId === "") {
      return;
    }

    const result = await axios.post(
      "http://localhost:3000/event/assignDriver",
      {
        eventId,
        driverId,
      },
      {
        headers: { authorization: token },
      },
    );

    if (result.status === 200) {
      alert("Event approved successfully");
      window.location.reload();
    }
  }, [eventId, driverId]);

  if (!event) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="container">
      <h1>{event.event}</h1>
      <p>{new Date(event.time).toLocaleString()}</p>
      <p>{event.approved ? "Approved" : "Approval Pending"}</p>
      <p>{event.completed ? "Completed" : "Not Completed"}</p>
      <p>
        {event.driver ? (
          `Driver: ${event.driver.name}`
        ) : freeDrivers ? (
          <div>
            <label htmlFor="driver">Choose a driver:</label>
            <select
              name="driver"
              id="driver"
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Select a driver</option>
              {freeDrivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <button onClick={approveEvent}>Approve Event</button>
          </div>
        ) : (
          "Loading..."
        )}
      </p>
    </div>
  );
};

export default AdminEventApproval;
