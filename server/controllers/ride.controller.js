import { differenceInHours } from "date-fns";
import { RideModel } from "../models/RideModel.js";
import { getStudent } from "../utils/getStudent.js";
import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import { StudentModel } from "../models/StudentModel.js";

/**
 * A controller function that handles the POST request to book a ride.
 *
 * @typedef {Object} Body
 * @property {string} time - The time of the ride.
 * @property {boolean} toUni - A boolean that is true if the ride is to uni and false if the ride is from uni.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the time and toUni boolean in the body which is sent by the client and the id which is added by the middleware.
 * @param {Response} res - Response object.
 */
const book_POST = async (req, res) => {
  try {
    // Get the time and toUni boolean from the req body
    // Time will be a JS Date string and toUni will be a boolean
    const { time, toUni } = req.body;

    // Get the student from the database
    const studentDoc = await getStudent(req);

    // Check if the duration between the time sent by the client and the current time is less than 2 hours
    const diff = differenceInHours(new Date(time), new Date()); // new Date() will return the current time
    if (diff < 1) {
      // send response to client
      return res.status(400).json("You can only book a ride 1 hour in advance");
    }

    // Now we have 4 cases:
    // 1. The student has a ride booked already on that day with toUni = true
    // 2. The student has a ride booked already on that day with toUni = false
    // 3. The student has 2 rides booked already on that day (one to uni and one from uni)
    // 4. The student has no ride booked on that day
    // In order to check which case we are in, we need to check our database collection for a ride with the field bookedBy equal to the student's id
    // and the field time equal to the time sent by the client.
    // We will use the find() function to find all the rides that match the above criteria.
    const ridesOnThatDay = await RideModel.find({
      bookedBy: studentDoc._id,
      time: {
        // We are using the startOfDay and endOfDay functions from the date-fns library to get the start and end of the day of the time sent by the client.
        $gte: startOfDay(new Date(time)), // $gte means greater than or equal to
        $lt: endOfDay(new Date(time)), // $lt means less than
      },
    });

    // Case 4
    // if has no ride booked on that day
    if (ridesOnThatDay.length === 0) {
      // This is a simple case. We just need to create a new ride object and save it to the database.
      const newRide = new RideModel({
        time,
        toUni,
        completed: false,
        bookedBy: studentDoc._id, // We are using the student's id as the value for the bookedBy field.
        driver: null, // We are setting the driver field to null because we don't have a driver yet.
      });

      // Save the ride object to the database
      await newRide.save();

      // send response to client
      return res.status(200).json("Ride booked successfully");
    }

    // Case 3
    // if has 2 rides booked already on that day (one to uni and one from uni)
    if (ridesOnThatDay.length === 2) {
      // This is also a simple case. The user is done for the day. We just need to send a response to the client.
      // send response to client
      return res
        .status(400)
        .json("You already have 2 rides booked on that day");
    }

    // Now we have 2 cases left:
    // 1. The student has a ride booked already on that day with toUni = true
    // 2. The student has a ride booked already on that day with toUni = false
    // These 2 cases are very similar. The only difference is the toUni boolean.
    // We will use the toUni boolean to check which case we are in.
    const rideBookedOnThatDay = ridesOnThatDay[0]; // We know that there is only one ride in the array because we checked the length of the array to not be 0 or 2.

    // The bottom line is checking if the toUni boolean of the ride booked on that day is equal to the toUni boolean sent by the client.
    // If they both are false, then the student is trying to rebook another ride from uni on the same day.
    // If they both are true, then the student is trying to rebook another ride to uni on the same day.
    // In both cases, we will just not allow the student to book another ride on the same day.
    if (rideBookedOnThatDay.toUni === toUni) {
      // send response to client
      return res.status(400).json("You already have a ride booked on that day");
    }

    // In case we are here, this means that the student has a ride booked already on that day with either toUni = true or toUni = false.
    // This means that the student is trying to book another ride from uni on the same day with toUni different from the toUni of the ride booked on that day.
    // In this case, we will create a new ride object and save it to the database.
    const newRide = new RideModel({
      time,
      toUni,
      completed: false,
      bookedBy: studentDoc._id, // We are using the student's id as the value for the bookedBy field.
      driver: null, // We are setting the driver field to null because we don't have a driver yet.
    });

    // Save the ride object to the database
    await newRide.save();

    // send response to client
    return res.status(200).json("Ride booked successfully");
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the GET request to get all the rides.
 *
 * @param {Request} req - Request object which is sent by the client and the id which is added by the middleware.
 * @param {Response} res - Response object.
 */
const getAll_GET = async (req, res) => {
  try {
    const student = await getStudent(req); // Get the student from the database

    // Get all the rides from the database
    const rides = await RideModel.find({
      bookedBy: student._id,
    }).populate("driver", "name number"); // We are using the populate function to get the driver object from the database

    // send response to client
    return res.status(200).json(rides);
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the POST request to get complete details of a ride.
 *
 * @typedef {Object} Body
 * @property {string} rideId - The id of the ride.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the rideId in the body which is sent by the client and the id which is added by the middleware. rideId is the id of the ride that the user wants to get the complete details of. and the id is the id of the student.
 * @param {Response} res - Response object.
 */
const getRide_POST = async (req, res) => {
  try {
    // Get the rideId from the req body
    const { rideId } = req.body;

    // Get the student from the database
    const student = await getStudent(req);

    // Get the ride from the database
    const ride = await RideModel.findById(rideId).populate(
      "driver",
      "name phone",
    ); // We are using the populate function to get the driver object from the database
    // and only get the name and phone fields of the driver object. This is because we want to get the complete details of the ride without getting the complete details of the driver.

    // Check if the does not exist
    if (!ride) {
      // send response to client
      return res.status(404).json("Ride not found");
    }

    // Check if the ride is booked by the student
    if (ride.bookedBy.toString() !== student._id.toString()) {
      // send response to client
      return res.status(403).json("Forbidden"); // Meaning that the ride is not booked by the student and the student is not allowed to get the details of the ride.
    }

    // send response to client
    return res.status(200).json(ride);
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the POST request to delete a ride.
 *
 * @typedef {Object} Body
 * @property {string} rideId - The id of the ride.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the rideId in the body which is sent by the client and the id which is added by the middleware. rideId is the id of the ride that the user wants to delete. and the id is the id of the student.
 * @param {Response} res - Response object.
 */
const deleteRide_POST = async (req, res) => {
  try {
    // Get the rideId from the req body
    const { rideId } = req.body;

    // Get the student from the database
    const student = await getStudent(req);

    // Get the ride from the database
    const ride = await RideModel.findById(rideId);

    // Check if the does not exist
    if (!ride) {
      // send response to client
      return res.status(404).json("Ride not found");
    }

    // Check if the ride is booked by the student
    if (ride.bookedBy.toString() !== student._id.toString()) {
      // send response to client
      return res.status(403).json("Forbidden"); // Meaning that the ride is not booked by the student and the student is not allowed to delete the ride.
    }

    // Check if the ride is already completed or driver is assigned
    if (ride.completed || ride.driver !== null) {
      // send response to client
      return res
        .status(400)
        .json("Ride already completed or driver is assigned");
    }

    // Delete the ride from the database
    await RideModel.findByIdAndDelete(rideId);

    // send response to client
    return res.status(200).json("Ride deleted successfully");
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the POST request to complete a ride.
 * The QR Code when scanned will open a link in the browser with the rideId in the url.
 * e.g. https://localhost:8080/complete-ride/<rideId>
 * The rideId is then obtained from the url and sent in the body of the request to this controller function by the client.
 *
 * @typedef {Object} Body
 * @property {string} rideId - The id of the ride.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the rideId in the body
 * @param {Response} res - Response object.
 */
const completeRide_POST = async (req, res) => {
  try {
    // Get the rideId from the req body
    const { rideId } = req.body;

    // Get the student from the database
    const student = await getStudent(req);

    // Get the ride from the database
    const ride = await RideModel.findById(rideId);

    // Check if the does not exist
    if (!ride) {
      // send response to client
      return res.status(404).json("Ride not found");
    }

    // Check if the ride is booked by the student
    if (ride.bookedBy.toString() !== student._id.toString()) {
      // send response to client
      return res.status(403).json("Forbidden"); // Meaning that the ride is not booked by the student and the student is not allowed to complete the ride.
    }

    // Check if the ride is already completed
    if (ride.completed) {
      // send response to client
      return res.status(400).json("Ride already completed");
    }

    // Complete the ride
    ride.completed = true;
    await ride.save();

    // send response to client
    return res.status(200).json("Ride completed successfully");
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the POST request to book a ride.
 *
 * @typedef {Object} Body
 * @property {string} time - The time of the ride.
 * @property {boolean} toUni - A boolean that is true if the ride is to uni and false if the ride is from uni.
 * @property {string} studentId - The id of the student.
 * @param {Request<{}, {}, Body, {}>} req - Request object with the time and toUni boolean in the body which is sent by the client and the id which is added by the middleware.
 * @param {Response} res - Response object.
 */
const createRide_POST = async (req, res) => {
  try {
    // Get the time, toUni boolean and studentId from the req body
    const { time, toUni, studentId } = req.body;

    // Get the student from the database
    const student = await StudentModel.findById(studentId);

    const newRide = new RideModel({
      time,
      toUni,
      completed: false,
      bookedBy: student._id, // We are using the student's id as the value for the
      driver: null, // We are setting the driver field to null because we don't have a driver yet.
    });

    // Save the ride object to the database
    await newRide.save();

    return res.status(200).json("Ride created successfully");
  } catch (error) {
    console.log(error);
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

export {
  book_POST,
  getAll_GET,
  getRide_POST,
  completeRide_POST,
  deleteRide_POST,
  createRide_POST,
};
