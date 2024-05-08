import { getSecretary } from "../utils/getSecretary.js";
import { getAdmin } from "../utils/getAdmin.js";
import { getStudent } from "../utils/getStudent.js";
import { EventModel } from "../models/EventModel.js";
import { DriverModel } from "../models/DriverModel.js";

const book_POST = async (req, res) => {
  try {
    const { event, time } = req.body;

    const secretary = await getSecretary(req);

    const eventsOnThatDay = await EventModel.find({
      bookedBy: secretary._id,
      time: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    if (eventsOnThatDay.length === 0) {
      const newEvent = new EventModel({
        event,
        time,
        approved: false,
        completed: false,
        bookedBy: secretary._id,
        driver: null,
      });
      await newEvent.save();
      return res.status(200).json(newEvent);
    }

    if (eventsAtSpecificTime.length === 1) {
      return res
        .status(400)
        .json("You already have an event booked on that time");
    }
  } catch (error) {
    console.error(error);
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
    const admin = await getAdmin(req);

    // Get all the rides from the database
    const events = await EventModel.find({})
      .populate("bookedBy", "username")
      .populate("driver", "name phone");

    // send response to client
    return res.status(200).json(events);
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

    // Get the event from the database
    const event = await EventModel.findById(eventId)
      .populate("driver", "name phone")
      .populate("bookedBy", "username")
      .populate("students", "username");

    // Check if the does not exist
    if (!event) {
      // send response to client
      return res.status(404).json("Event not found");
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
    event.approved = true;
    await event.save();

    driver.available = false;
    driver.alloted = true;
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

const getOpenEvents_GET = async (req, res) => {
  try {
    const student = await getStudent(req);

    const openEvents = await EventModel.find({
      approved: true,
      completed: false,
    });

    openEvents = openEvents.map((event) => {
      return {
        ...event,
        registered: event.students.includes(student._id),
      };
    });

    return res.status(200).json(openEvents);
  } catch (error) {
    console.log(error);
    res.status(500).json("Error fetching open events");
  }
};

const registerEvent_POST = async (req, res) => {
  try {
    const student = await getStudent(req);
    const { eventId } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json("Event not found");
    }

    event.students.push(student._id);
    await event.save();

    return res.status(200).json("Event registered successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Error registering event");
  }
}

export {
  book_POST,
  getAll_GET,
  getEvent_POST,
  approveEvent_POST,
  assignDriver_POST,
  completeEvent_POST,
  getOpenEvents_GET,
  registerEvent_POST
};
