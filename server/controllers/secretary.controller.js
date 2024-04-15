import { SECRET_KEY } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import { SecretaryModel } from "../models/SecretaryModel.js";
import { EventModel } from "../models/EventModel.js";

const login_POST = async (req, res) => {
  try {
    const { username, password } = req.body;
    const secretary = await SecretaryModel.findOne({ username: username });
    if (!secretary) {
      return res.json("Secretary not found");
    }

    if (secretary.password !== password) {
      return res.json("Password incorrect");
    }

    const token = jwt.sign(
      { id: admin._id, userType: "secretary" },
      SECRET_KEY,
    );
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

const profile_GET = async (req, res) => {
  try {
    const secretaryId = req.id; //getting back line 72
    const secretary = await SecretaryModel.findById(secretaryId); //find student document from database with ID

    if (!secretary) {
      return res.status(404).json("Secretary not found");
    }

    res.status(200).json(secretary);
  } catch (error) {
    console.log(error);
    res.status(500).json("Secretary not found");
  }
};

const getAllEvents_GET = async (req, res) => {
  try {
    // Get all the events from the database
    const events = await EventModel.find({})
      .populate("bookedBy", "names") // Populate the bookedBy field with the names of the student who booked the event
      .populate("driver", "name"); // Populate the driver field with the name of the driver
    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json("Error retrieving events");
  }
};

// Create a new event
const createEvent_POST = async (req, res) => {
  try {
    const { event, time } = req.body;

    // Create a new event
    const newEvent = new EventModel({
      event,
      time: new Date(time),
      approved: false, // By default, the event is not approved
      driver: null, // By default, no driver is assigned
    });

    // Save the new event to the database
    await newEvent.save();

    return res.status(201).json(newEvent);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error creating event");
  }
};

export { login_POST, profile_GET, getAllEvents_GET, createEvent_POST };
