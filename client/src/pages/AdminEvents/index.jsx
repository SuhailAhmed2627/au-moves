import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/event/getAll", {
        headers: { authorization: token },
      });

      const data = result.data;
      setEvents(data);
    };

    fetchFromServer();
  }, []);

  if (!events) {
    return <h2>Loading...</h2>;
  }

  const approvedEvents = events.filter((event) => event.approved === true);
  const pendingEvents = events.filter((event) => event.approved === false);

  return (
    <div>
      <div className="container">
        <h1>Pending Events</h1>
        {pendingEvents.map((event) => (
          <div key={event.id} className="card">
            <h2>{event.event}</h2>
            <p>{new Date(event.time).toLocaleString()}</p>
            <p>{"Approval Pending"}</p>
            <Link to={`/adminHome/adminEventApproval/${event._id}`}>
              Approve
            </Link>
          </div>
        ))}
      </div>
      <details className="container">
        <summary>Approved Events</summary>
        {approvedEvents.map((event) => (
          <div key={event.id} className="card">
            <h2>{event.event}</h2>
            <p>{new Date(event.time).toLocaleString()}</p>
            <p>{"Approved"}</p>
            <p>{event.completed ? "Completed" : "Not Completed"}</p>
            <p>{`Driver: ${event.driver.name}`}</p>
          </div>
        ))}
      </details>
    </div>
  );
};

export default AdminEvents;
