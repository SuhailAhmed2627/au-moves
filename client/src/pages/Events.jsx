import React, { useState, useEffect } from "react";
import axios from "axios";

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/event/open", {
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

  return (
    <div>
      <h1>Open Events</h1>
      {events.map((event) => (
        <div key={event.id} className="card">
          <h2>{event.event}</h2>
          <p>{new Date(event.time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Events;
