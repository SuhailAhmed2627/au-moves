import { useState, useEffect } from "react";
import DayTimePicker from "@mooncake-dev/react-day-time-picker";
import "./SetDate.css";
import styled from "styled-components";

const Container = styled.div`
  width: 320px;
  margin: 0 auto;
  color: #333;
  font-family: "Arial", sans-serif;
`;

function SetDate() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleErr, setScheduleErr] = useState("");
  const [toUni, setToUni] = useState(true);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchBookedSlots(new Date()).then(setRides);
  }, []);

  async function fetchBookedSlots(date) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3000/ride/getAll?date=${date.toISOString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );
    const rides = await response.json();
    return rides;
  }

  const handleScheduled = (time, toUni) => {
    setIsScheduling(true);
    setScheduleErr("");

    const token = localStorage.getItem("token");
    console.log("Token: ", token);
    fetch("http://localhost:3000/ride/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        time,
        toUni,
      }),
    })
      .then((response) => response.json())
      .catch((err) => {
        console.error(err);
      })
      .then((json) => {
        setScheduleErr("");
        setIsScheduled(true);
        console.log(
          "Ride time: ",
          time,
          ", To Uni: ",
          toUni,
          " booked successfully.",
        );
        console.log("Server response: ", json);
      })
      .catch((err) => {
        setScheduleErr(err);
      })
      .finally(() => {
        setIsScheduling(false);
      });
  };

  function timeSlotValidator(slotTime) {
    // Convert the slotTime to the format used in your rides array
    const slotDate = slotTime.toISOString().split("T")[0];
    const slotHour = slotTime.getHours();

    const morningSlot = [8, 10, 12];
    const eveningSlot = [13, 15, 17, 19];

    // Check if there is a ride booked on the selected date in the morning
    const isMorningRideBooked = rides.some((ride) => {
      const rideDate = new Date(ride.time).toISOString().split("T")[0];
      const rideHour = new Date(ride.time).getHours();
      return rideDate === slotDate && rideHour < 12;
    });

    // Check if there is a ride booked on the selected date in the evening
    const isEveningRideBooked = rides.some((ride) => {
      const rideDate = new Date(ride.time).toISOString().split("T")[0];
      const rideHour = new Date(ride.time).getHours();
      return rideDate === slotDate && rideHour >= 12;
    });

    if (toUni) {
      // If there is a ride in the morning and the slot is in the morning, disable the slot
      if (isMorningRideBooked && morningSlot.includes(slotHour)) {
        return false;
      }
      return morningSlot.includes(slotHour);
    }

    const now = new Date();
    const nowHours = now.getHours();
    const nowDate = now.getDate();
    const difference = slotHour - nowHours;

    if (slotTime.getDate() === nowDate && difference < 1) {
      return false;
    }

    // If there is a ride in the evening and the slot is in the evening, disable the slot
    if (isEveningRideBooked && eveningSlot.includes(slotHour)) {
      return false;
    }

    return eveningSlot.includes(slotHour);
  }

  return (
    <>
      <div className="switch-field">
        <input
          type="radio"
          id="radio-one"
          name="switch-one"
          value="toUni"
          checked={toUni === true}
          onChange={() => setToUni(true)}
        />
        <label htmlFor="radio-one">To Uni</label>

        <input
          type="radio"
          id="radio-two"
          name="switch-one"
          value="fromUni"
          checked={toUni === false}
          onChange={() => setToUni(false)}
        />
        <label htmlFor="radio-two">From Uni</label>
      </div>
      <Container>
        <DayTimePicker
          timeSlotSizeMinutes={60}
          isLoading={isScheduling}
          isDone={isScheduled}
          err={scheduleErr}
          onConfirm={(date) => handleScheduled(date, toUni)}
          timeSlotValidator={timeSlotValidator}
        />
      </Container>
    </>
  );
}

export default SetDate;
