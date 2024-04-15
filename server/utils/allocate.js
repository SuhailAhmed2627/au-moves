import { RideModel } from "../models/RideModel.js";
import { DriverModel } from "../models/DriverModel.js";
import { clusterWithMinimumElements, iterativeClustering } from "./clustering.js";

/**
 * A controller function that handles the POST request to delete a ride.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the rideId in the body which is sent by the client and the id which is added by the middleware. rideId is the id of the ride that the user wants to delete. and the id is the id of the student.
 * @param {Response} res - Response object.
 */
const allocateStudentsToDrivers = async () => {
  const now = new Date(); // This will be used to get the current date and time.
  // Based on the current time, we will decide which rides to allocate. Morning rides or evening rides.
  // We have 5 cases:
  // 1. Allocate drivers for all morning rides. That is 8:00, 10:00, and 12:00. This will be done at 00:05.
  // 2. Allocate drivers for the ride at 13:00. This will be done at 11:05.
  // 3. Allocate drivers for the ride at 15:00. This will be done at 13:05.
  // 4. Allocate drivers for the ride at 18:00. This will be done at 16:05.
  // 5. Allocate drivers for the ride at 20:00. This will be done at 18:05.

  const hours = now.getHours();

  switch (hours) {
    case 0: // 00:05, allocate drivers for all morning rides
      allocateDriversToRidesForPickup();
      break;
    case 11: // 11:05, allocate drivers for the ride at 13:00
      allocateDriversForSpecificSlot("13:00");
      break;
    case 13: // 13:05, allocate drivers for the ride at 15:00
      allocateDriversForSpecificSlot("15:00");
      break;
    case 15: // 16:05, allocate drivers for the ride at 18:00
      allocateDriversForSpecificSlot("17:00");
      break;
    case 18: // 18:05, allocate drivers for the ride at 20:00
      allocateDriversForSpecificSlot("20:00");
      break;
    default:
      break;
  }
};

/**
 * A function that allocates drivers to rides for a specific slot.
 *
 * @param {Date} slot - The slot for which the drivers need to be allocated.
 */
const allocateDriversForSpecificSlot = async (slot) => {
  // Making a date object with the given slot time on that specific day.
  const dateWithSlotTime = slot;

  // Get all the rides that are available for the given slot and have no driver.
  const rides = await RideModel.find({
    time: dateWithSlotTime,
    driver: null,
  }).populate("bookedBy", "latitude longitude");


  console.log(`Rides for slot ${slot}: ${rides.length}`);

  // Get all the drivers that are not alloted
  const drivers = await DriverModel.find({ alloted: false });

  console.log(`Drivers not alloted: ${drivers.length}`);

  // If there are no rides or drivers, then return.
  if (rides.length == 0 || drivers.length == 0) {
    return;
  }

  // Get all the student locations from the rides and flatten the array, so that we have an array of student locations.
  const studentLocations = rides.map((ride) => ({
    id: ride._id,
    latitude: ride.bookedBy.latitude,
    longitude: ride.bookedBy.longitude,
  }));

  try {

    console.log(`Iterative clustering for slot ${slot} ===================`);
    // Get clusters of students based on their location
    const clusters = iterativeClustering(studentLocations, drivers.length);

    console.log(`Clusters for slot ${slot}: ${clusters.length}`);

    // Allocate drivers to rides
    // For each cluster, we will allocate a driver
    clusters.forEach(async (cluster, index) => {
      // Get the driver that will be allocated to this cluster
      const driver = drivers[index];

      // Get the ids of the rides in this cluster
      const ridesInCluster = clusters[index].map((cluster) => cluster.id);

      ridesInCluster.forEach(async (rideId) => {
        // Update the ride with the driver
        await RideModel.findByIdAndUpdate(rideId, { driver: driver._id });
      });

      // Set the driver to unavailable
      driver.alloted = false;
      await driver.save();
    });
  } catch (error) {
    throw new Error("Error allocating drivers to rides");
  }
};

const getStudentLocations = async (slot) => {
  // Making a date object with the given slot time on that specific day.
  const dateWithSlotTime = new Date();
  dateWithSlotTime.setHours(slot.split(":")[0]);
  dateWithSlotTime.setMinutes(slot.split(":")[1]);
  dateWithSlotTime.setSeconds(0);
  dateWithSlotTime.setMilliseconds(0);

  // Get all the rides that are available for the given slot and have no driver.
  const rides = await RideModel.find({
    time: dateWithSlotTime,
    driver: null,
  }).populate("students", "latitude longitude");

  // If there are no rides or drivers, then return.
  if (rides.length == 0) {
    return [];
  }

  // Get all the student locations from the rides and flatten the array, so that we have an array of student locations.
  const studentLocations = rides.map((ride) => ({
    id: ride._id,
    latitude: ride.bookedBy.latitude,
    longitude: ride.bookedBy.longitude,
  }));

  return studentLocations;
};

const allocateDriversToRidesForPickup = async () => {
  // Find all the clusters required for all three pickup times
  const morningSlots = ["08:00", "10:00", "12:00"];
  // Get all the drivers that are available
  const drivers = await DriverModel.find({ available: true });
  if (drivers.length == 0) {
    return;
  }
  let allClusters = [];
  let minNumberOfElementsInCluster = 11;
  let satisfactory = true;

  while (satisfactory) {
    minNumberOfElementsInCluster--;
    let currentAllClusters = [];
    morningSlots.forEach(async (slot) => {
      const studentLocations = await getStudentLocations(slot);
      const clusters = clusterWithMinimumElements(
        studentLocations,
        minNumberOfElementsInCluster,
      );
      currentAllClusters = currentAllClusters.concat(clusters);
    });
    if (currentAllClusters.length == 0) {
      continue;
    }
    if (currentAllClusters.length > drivers.length) {
      satisfactory = false;
    }
  }

  // Allocate drivers to rides
  // For each cluster, we will allocate a driver
  allClusters.forEach(async (cluster, index) => {
    // Get the driver that will be allocated to this cluster
    const driver = drivers[index];

    // Get the ids of the rides in this cluster
    const ridesInCluster = cluster.map((cluster) => cluster.id);

    ridesInCluster.forEach(async (rideId) => {
      // Update the ride with the driver
      await RideModel.findByIdAndUpdate(rideId, { driver: driver._id });
    });

    // Set the driver to unavailable
    driver.available = false;
    await driver.save();
  });
};

export { allocateStudentsToDrivers, allocateDriversForSpecificSlot };
