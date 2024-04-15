import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import classes from "./AdminAccount.module.css";
import { getPickUpTimeForSlot } from "../../utils/drive.js";

const K_WIDTH = 40;
const K_HEIGHT = 40;

const getColorFromIndex = (index) => {
  const colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
  ];
  const color = colors[index % colors.length];
  return color;
};

const placeStyle = (color) => {
  return {
    // initially any map object has left top corner at lat lng coordinates
    // it's on you to set object origin to 0,0 coordinates
    position: "absolute",
    width: K_WIDTH,
    height: K_HEIGHT,
    left: -K_WIDTH / 2,
    top: -K_HEIGHT / 2,

    border: "5px solid " + color,
    borderRadius: K_HEIGHT,
    backgroundColor: "white",
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    padding: 4,
  };
};

const Marker = ({ text, color }) => {
  return <div style={placeStyle(color)}>{text}</div>;
};

/**
 * @typedef Student
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} names
 */

/**
 * @typedef RideData
 * @property {Student} bookedBy
 * @property {boolean} completed
 */

function AdminAccount() {
  const [profile, setProfile] = useState(null); //profile is initially null, set after fetching from server
  const [slotValue, setSlotValue] = useState(8); //slotValue is initially 8, set after changing select value
  const [date, setDate] = useState(null); //date is initially empty, set after changing date
  //after rendering for the first time, the function in useEffect will take place
  const [ridesByTimeData, setRidesByTime] = useState(null);
  const [allocatedData, setAllocatedData] = useState(null);
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchFromServer = async () => {
      const result = await axios.get("http://localhost:3000/admin/profile", {
        //sending request from frontend to backend
        headers: { authorization: token }, //setting headers with token
      });

      const data = result.data; //json from server
      setProfile(data);
    };

    fetchFromServer();
  }, []);

  const getRidesByTime = useCallback(async () => {
    const token = localStorage.getItem("token");
    const time = new Date(date);
    time.setHours(slotValue);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    const result = await axios.post(
      "http://localhost:3000/admin/getRidesByTime",
      {
        time,
      },
      {
        headers: { authorization: token },
      },
    );

    if (result.status === 200) {
      setRidesByTime(result.data);
    }
  }, [date, slotValue]);

  const allocate = useCallback(async () => {
    const token = localStorage.getItem("token");
    const time = new Date(date);
    time.setHours(slotValue);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    const result = await axios.post(
      "http://localhost:3000/admin/allocate",
      {
        time,
      },
      {
        headers: { authorization: token },
      },
    );

    setAllocatedData(result.data.driverIdToRidesMap);
  }, [date, slotValue]);

  const setTimeForSlot = useCallback(async () => {
    const token = localStorage.getItem("token");
    const time = new Date(date);
    time.setHours(slotValue);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);

    const directionService = new maps.DirectionsService();

    const results = await getPickUpTimeForSlot(
      allocatedData,
      directionService,
      time,
    );

    const allRides = [];
    const allDriversAndDepartureTimes = [];

    const directionRenderer = new maps.DirectionsRenderer();
    directionRenderer.setMap(map);
    directionRenderer.setDirections(results[Object.keys(results)[0]].result);

    for (const driverId in results) {
      delete results[driverId].result;
      allRides.push(...results[driverId].rides);
      allDriversAndDepartureTimes.push({
        driverId,
        departureTime: results[driverId].departureTime,
        link: results[driverId].link,
      });
    }

    const allRideIdsAndPickUpTimes = allRides.map((ride) => ({
      rideId: ride._id,
      pickUpOrDropTime: ride.pickUpOrDropTime,
    }));

    const res = await fetch(
      "http://localhost:3000/admin/setPickUpTimeForRidesAndDeptTimeForDrivers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          rides: allRideIdsAndPickUpTimes,
          drivers: allDriversAndDepartureTimes,
        }),
      },
    );

    if (res.status === 200) {
      console.log("Pick Up Time Set");
    }
  }, [date, slotValue, allocatedData, maps]);

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <h1>Hi Admin</h1>
        <input
          type="date"
          placeholder="Select Date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
          }}
        />
        <select
          placeholder="Select Slot"
          value={slotValue}
          onChange={(e) => {
            setSlotValue(e.target.value);
          }}
        >
          <option value="8">8:00</option>
          <option value="10">10:00</option>
          <option value="12">12:00</option>
          <option value="13">13:00</option>
          <option value="15">15:00</option>
          <option value="17">17:00</option>
          <option value="19">19:00</option>
        </select>
        <button onClick={getRidesByTime}>View Data</button>
        <button onClick={allocate}>Allocate</button>
        <button onClick={setTimeForSlot}>Set Pick Up Time</button>
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg" }}
        defaultCenter={{ lat: 25.25501406134556, lng: 55.30984464299601 }}
        defaultZoom={11}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          setMap(map);
          setMaps(maps);
        }}
      >
        {!allocatedData &&
          ridesByTimeData &&
          ridesByTimeData.map((ride) => (
            <Marker
              lat={ride.bookedBy.latitude}
              lng={ride.bookedBy.longitude}
              text={ride.bookedBy.names}
            />
          ))}
        {allocatedData &&
          Array.from(Object.entries(allocatedData)).map(([driverId, rides]) => {
            return rides.map((ride, index) => (
              <Marker
                lat={ride.bookedBy.latitude}
                lng={ride.bookedBy.longitude}
                text={ride.bookedBy.names}
                color={getColorFromIndex(driverId.split("Driver")[1])}
              />
            ));
          })}
      </GoogleMapReact>
    </div>
  );
}

export default AdminAccount;
