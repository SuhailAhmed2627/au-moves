import { addSeconds, differenceInMinutes, subHours, subMinutes, subSeconds } from "date-fns";

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

const getDirectionsForTime = async (time, rides, directionsService) => {
  return directionsService.route({
    origin: {
      lat: UNIVERSITY.latitude,
      lng: UNIVERSITY.longitude,
    },
    waypoints: rides.map((ride) => ({
      location: {
        lat: ride.bookedBy.latitude,
        lng: ride.bookedBy.longitude,
      },
      stopover: true,
    })),
    destination: {
      lat: UNIVERSITY.latitude,
      lng: UNIVERSITY.longitude,
    },
    drivingOptions: {
      departureTime: time,
      trafficModel: "bestguess",
    },
    travelMode: "DRIVING",
    optimizeWaypoints: true,
  });
}

const calculateDuration = (route) => {
  let duration = 0;
  route.legs.forEach((leg) => {
    duration += leg.duration.value;
  });
  return duration;
}

const getDirectionsForSlot = async (rides, slot, directionsService) => {
  const arrivalTime = slot;

  if ([13, 15, 17, 19].includes(slot.getHours())) {
    const directionsResponse0 = await getDirectionsForTime(slot, rides, directionsService);
    const route0 = directionsResponse0.routes[0];
    const duration0 = calculateDuration(route0);
    return { departureTime: arrivalTime, route: route0, result: directionsResponse0 };
  }

  const departureTime = subHours(new Date(slot), 3);

  const directionsResponse0 = await getDirectionsForTime(departureTime, rides, directionsService);
  const route0 = directionsResponse0.routes[0];
  const duration0 = calculateDuration(route0);


  if (differenceInMinutes(addSeconds(departureTime, duration0), arrivalTime) < 20) {
    return { departureTime, route: route0, result: directionsResponse0 };
  }

  const newDepartureTime = subMinutes(subSeconds(arrivalTime, duration0), 20);

  const directionsResponse1 = await getDirectionsForTime(newDepartureTime, rides);

  return { departureTime: newDepartureTime, route: directionsResponse1.routes[0], result: directionsResponse1 };
}

const createMapLink = (rides, result) => {
  const orderedRides = result.routes[0].waypoint_order.map((index) => rides[index]);
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.append("api", "1");
  url.searchParams.append("origin", `${UNIVERSITY.latitude},${UNIVERSITY.longitude}`);
  url.searchParams.append("destination", `${UNIVERSITY.latitude},${UNIVERSITY.longitude}`);
  url.searchParams.append("waypoints", orderedRides.map((ride) => `${ride.bookedBy.latitude},${ride.bookedBy.longitude}`).join("|"));
  url.searchParams.append("travelmode", "driving");
  return url.toString();
}

const getPickUpTimeForDriver = async (driverId, rides, slot, directionsService) => {
  const directionsData = await getDirectionsForSlot(rides, slot, directionsService);
  const { departureTime, route, result } = directionsData;

  const link = createMapLink(rides, result);

  const legs = route.legs;
  const waypointOrder = route.waypoint_order

  let totalDuration = 0;
  for (let i = 0; i < legs.length - 1; i++) {
    const leg = legs[i];
    totalDuration += leg.duration.value;
    const ride = rides[waypointOrder[i]];
    ride["pickUpOrDropTime"] = addSeconds(departureTime, totalDuration);
  }

  return { driverId, rides, result, departureTime, link };
}

const getPickUpTimeForSlot = async (driverIdToRidesObject, directionsService, slot) => {
  const temp = {};
  for (const key in driverIdToRidesObject) {
    const driverId = key;
    const rides = driverIdToRidesObject[key];
    const data = await getPickUpTimeForDriver(driverId, rides, slot, directionsService);
    temp[driverId] = data;
  }
  return temp;
}


export { getPickUpTimeForSlot };