import { Client } from "@googlemaps/google-maps-services-js";
import { addSeconds, differenceInMinutes, subHours, subMinutes, subSeconds } from "date-fns";
import { RideModel } from "../models/RideModel.js";

const UNIVERSITY = {
  latitude: 25.412264,
  longitude: 55.506575,
};

// const requestObject = {
//   origin: {
//     location: {
//       latLng: UNIVERSITY
//     }
//   },
//   destination: {
//     location: {
//       latLng: UNIVERSITY
//     }
//   },
//   travelMode: "DRIVE",
//   routingPreference: "TRAFFIC_AWARE"
// }

// const fieldMask = "routes.duration, routes.legs, routes.polyline"

// import routing from "@googlemaps/routing";
// import { GoogleAuth } from "google-auth-library";

// const routingClient = new routing.v2.RoutesClient({
//   authClient: new GoogleAuth().fromAPIKey(
//     "AIzaSyA2iBgN6KqXEGHlgYXHfgP2_9w6_7XrU2k"
//   ),
// });

// async function callComputeRoutes() {
//   // Run request
//   const response = await routingClient.computeRoutes(
//     {
//       origin: {
//         latLng: UNIVERSITY
//       },
//       destination: {
//         latLng: UNIVERSITY
//       },
//     },
//     {
//       otherArgs: {
//         headers: {
//           "X-Goog-FieldMask": "*",
//         },
//       },
//     }
//   );
//   console.log(response);
// }

// callComputeRoutes();

const getDirectionsForTime = async (time, rides, client) => {
  return client.directions({
    params: {
      origin: {
        lat: UNIVERSITY.latitude,
        lng: UNIVERSITY.longitude,
      },
      waypoints: rides.map((ride) => ({
        lat: ride.bookedBy.latitude,
        lng: ride.bookedBy.longitude,
      })),
      destination: {
        lat: UNIVERSITY.latitude,
        lng: UNIVERSITY.longitude,
      },
      mode: "driving",
      optimize: true,
      departureTime: time,
    }
  });
}

const calculateDuration = (directionsResponseData) => {
  let duration = 0;
  directionsResponseData.routes[0].legs.forEach((leg) => {
    duration += leg.duration.value;
  });
  return duration;
}

const getDirectionsForSlot = async (rides, slot, client) => {
  const arrivalTime = new Date(slot);
  const departureTime = subHours(new Date(slot), 3);

  const directionsResponse0 = await getDirectionsForTime(departureTime, rides, client);

  if (directionsResponse0.data.status !== "OK") {
    console.log("Error getting directions");
    return;
  }

  const directionsResponseData = directionsResponse0.data;
  const duration0 = calculateDuration(directionsResponseData);
  if (differenceInMinutes(addSeconds(departureTime, duration0), arrivalTime) < 20) {
    return directionsResponseData;
  }

  const newDepartureTime = subMinutes(subSeconds(arrivalTime, duration0), 20);

  const directionsResponse1 = await getDirectionsForTime(newDepartureTime, rides);
  if (directionsResponse1.data.status !== "OK") {
    console.log("Error getting directions");
    return;
  }

  return directionsResponse1.data;
}

const setPickUpTimeForDriver = async (driverId, rides, slot, client) => {
  const directionsResponseData = await getDirectionsForSlot(rides, slot, client);
  const arrivalTime = new Date(slot);
  const duration = calculateDuration(directionsResponseData);

  console.log(`directionsResponseData`, directionsResponseData);
}

const setPickUpTimeForSlot = async (slot) => {
  const rides = await RideModel.find({
    time: slot,
    driver: {
      $ne: null,
    },
  }).populate("bookedBy", "latitude longitude").populate("driver", "name");

  const driverRidesObject = {};

  rides.forEach((ride) => {
    const driverId = ride.driver._id;
    if (!driverRidesObject[driverId]) {
      driverRidesObject[driverId] = [];
    }
    driverRidesObject[driverId].push(ride);
  });

  const client = new Client({});

  await client.elevation({
    params: {
      locations: [{ lat: 25.412264, lng: 55.506575 }],
      key: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"
    },
    timeout: 1000, // milliseconds
  })

  const temp = {};

  Object.entries(driverRidesObject).forEach(async ([driverId, rides]) => {
    const data = await setPickUpTimeForDriver(driverId, rides, slot, client);
    if (!temp[driverId]) {
      temp[driverId] = [];
    }
    temp[driverId].push(data);
  });

  console.log(`temp`, temp);

  return temp;
}


export { setPickUpTimeForSlot };