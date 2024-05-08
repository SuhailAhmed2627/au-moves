import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Account.css";

const SecretaryAccount = () => {
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState("");
  const [time, setTime] = useState("");

  const createEvent = useCallback(async () => {
    const token = localStorage.getItem("token");

    const result = await axios.post(
      "http://localhost:3000/event/book",
      { event, time },
      { headers: { authorization: token } },
    );

    if (result.status === 200) {
      setEvents([...events, result.data]);
    } else {
      alert("Error creating event");
    }
  }, [event, time]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/secretary/events", {
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
      <h1>Secretary Account</h1>
      <div>
        <h2>Create Event</h2>
        <input
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          type="text"
          placeholder="Event"
        />
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          type="datetime-local"
        />
        <button onClick={createEvent}>Create Event</button>
      </div>
      <div className="container">
        {events.map((event) => (
          <div key={event.id} className="card">
            <h2>{event.event}</h2>
            <p>{new Date(event.time).toLocaleString()}</p>
            <p>{event.approved ? "Approved" : "Not Approved"}</p>
            <p>{event.completed ? "Completed" : "Not Completed"}</p>
            <p>
              {event.driver
                ? `Driver: ${event.driver.name}`
                : "Driver not assigned"}
            </p>
            <ol>
              {event.students.map((student) => (
                <li key={student.id}>{student.username}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecretaryAccount;
