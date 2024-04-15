import { getStudent } from "../utils/getStudent.js";
import { EventModel } from "../models/EventModel.js";
import { DriverModel } from "../models/DriverModel.js";
/**
 * A controller function that handles the POST request to book an event.
 *
 * @typedef {Object} Body
 * @property {string} time - The time of the event.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the time and toUni boolean in the body which is sent by the client and the id which is added by the middleware.
 * @param {Response} res - Response object.
 */
const book_POST = async (req, res) => {
  try {
    // Get the time and toUni boolean from the req body
    // Time will be a JS Date string and toUni will be a boolean
    const { event, time } = req.body;

    // Get the student from the database
    const studentDoc = await getStudent(req);

    // Now we have 2 cases:

    // 1. The student has the event booked already on that day
    // 2. The student has no ride booked on that day
    // In order to check which case we are in, we need to check our database collection for an event with the field bookedBy equal to the student's id
    // and the field time equal to the time sent by the client.
    // We will use the find() function to find all the rides that match the above criteria.
    const eventsAtSpecificTime = await EventModel.find({
      bookedBy: studentDoc._id,
      time: new Date(time),
    });

    // Case 2
    // if has no event booked on that day
    if (eventsOnThatDay.length === 0) {
      // This is a simple case. We just need to create a new event object and save it to the database.
      const newEvent = new EventModel({
        event,
        time,
        approved: false,
        completed: false,
        bookedBy: studentDoc._id, // We are using the student's id as the value for the bookedBy field.
        driver: null, // We are setting the driver field to null because we don't have a driver yet.
      });

      // Save the ride object to the database
      await newEvent.save();

      // send response to client
      return res.status(200).json("Event booked successfully");
    }

    // Case 1
    // if has an event booked already for that day
    if (eventsAtSpecificTime.length === 1) {
      // This is also a simple case. The user is done for the day. We just need to send a response to the client.
      // send response to client
      return res
        .status(400)
        .json("You already have an event booked on that time");
    }
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the GET request to get all the events.
 *
 * @param {Request} req - Request object which is sent by the client and the id which is added by the middleware.
 * @param {Response} res - Response object.
 */
const getAll_GET = async (req, res) => {
  try {
    const student = await getStudent(req); // Get the student from the database

    // Get all the rides from the database
    const events = await EventModel.find({
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
 * A controller function that handles the POST request to get complete details of a event.
 *
 * @typedef {Object} Body
 * @property {string} eventId - The id of the event.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the eventId in the body which is sent by the client and the id which is added by the middleware. rideId is the id of the ride that the user wants to get the complete details of. and the id is the id of the student.
 * @param {Response} res - Response object.
 */
const getEvent_POST = async (req, res) => {
  try {
    // Get the eventId from the req body
    const { eventId } = req.body;

    // Get the student from the database
    const student = await getStudent(req);

    // Get the event from the database
    const event = await EventModel.findById(eventId).populate(
      "driver",
      "name phone",
    ); // We are using the populate function to get the driver object from the database
    // and only get the name and phone fields of the driver object. This is because we want to get the complete details of the ride without getting the complete details of the driver.

    // Check if the does not exist
    if (!event) {
      // send response to client
      return res.status(404).json("Event not found");
    }

    // Check if the event is booked by the student
    if (event.bookedBy.toString() !== student._id.toString()) {
      // send response to client
      return res.status(403).json("Forbidden"); // Meaning that the event is not booked by the student and the student is not allowed to get the details of the event.
    }

    // send response to client
    return res.status(200).json(event);
  } catch (error) {
    // send response to client
    return res.status(500).json("Internal server error");
  }
};

/**
 * A controller function that handles the POST request to approve a event.
 *
 * @typedef {Object} Body
 * @property {string} rideId - The id of the event.
 *
 * @param {Request<{}, {}, Body, {}>} req - Request object with the eventId in the body
 * @param {Response} res - Response object.
 */

// Controller to approve an event
const approveEvent_POST = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await EventModel.findById(eventId);

    if (!event) {
      return res.status(404).json("Event not found");
    }

    event.approved = true;
    await event.save();

    return res.status(200).json("Event approved successfully");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// Controller to assign a driver to an event
const assignDriver_POST = async (req, res) => {
  try {
    const { eventId, driverId } = req.body;
    const event = await EventModel.findById(eventId);
    const driver = await DriverModel.findById(driverId);

    if (!event) {
      return res.status(404).json("Event not found");
    }

    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    event.driver = driverId;
    await event.save();

    driver.available = false;
    await driver.save();

    return res.status(200).json("Driver assigned successfully");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const completeEvent_POST = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json("Event not found");
    }

    // Mark the event as completed
    event.completed = true;
    await event.save();

    // Set the driver's availability back to true
    await setDriverAvailability(event.driver, true);

    return res.status(200).json("Event marked as completed");
  } catch (error) {
    console.log(error);
    res.status(500).json("Error completing event");
  }
};

export {
  book_POST,
  getAll_GET,
  getEvent_POST,
  approveEvent_POST,
  assignDriver_POST,
  completeEvent_POST,
};
