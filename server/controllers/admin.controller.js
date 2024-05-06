import { SECRET_KEY } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import { AdminModel } from "../models/AdminModel.js";
import { RideModel } from "../models/RideModel.js";
import { DriverModel } from "../models/DriverModel.js";
import { StudentModel } from "../models/StudentModel.js";
import { allocateDriversForSpecificSlot } from "../utils/allocate.js";
import { setPickUpTimeForSlot } from "../utils/drive.js";

const login_POST = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminModel.findOne({ username: username });
    if (!admin) {
      return res.status(404).json("Admin not found");
    }

    if (admin.password !== password) {
      return res.status(401).json("Password incorrect");
    }

    const token = jwt.sign({ id: admin._id, userType: "admin" }, SECRET_KEY);
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

const profile_GET = async (req, res) => {
  try {
    const adminId = req.id; //getting back line 72
    const admin = await AdminModel.findById(adminId); //find student document from database with ID

    if (!admin) {
      return res.status(404).json("Admin not found");
    }

    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Admin not found");
  }
};

const getAllRides_GET = async (req, res) => {
  try {
    // Get all the rides from the database
    const rides = await RideModel.find({}).populate(
      "bookedBy",
      "names latitude longitude",
    ); // Populate the bookedBy field with the names, latitude and longitude of the student who booked the ride.
    return res.status(200).json(rides);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error retrieving rides");
  }
};

const getAllStudents_GET = async (req, res) => {
  try {
    // Get all the students from the database
    const students = await StudentModel.find({});
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error retrieving students");
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
    return res.status(500).json("Error retrieving events");
  }
};

const getAllRidesByTime_POST = async (req, res) => {
  try {
    const { time } = req.body;
    const rides = await RideModel.find({
      time: time,
      completed: false,
    }).populate("bookedBy", "names latitude longitude"); // Populate the bookedBy field with the names, latitude and longitude of the student who booked the ride.
    return res.status(200).json(rides);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error retrieving rides");
  }
};

const allocate_POST = async (req, res) => {
  try {
    const { time } = req.body;
    await allocateDriversForSpecificSlot(new Date(time));
    const ridesForSlot = await RideModel.find({
      time: new Date(time),
      driver: {
        $ne: null,
      },
    })
      .populate("bookedBy", "latitude longitude")
      .populate("driver", "name");

    const driverIdToRidesMap = {};

    console.log(`Rides for slot `, ridesForSlot.length);

    for (const ride of ridesForSlot) {
      if (driverIdToRidesMap[ride.driver.name]) {
        driverIdToRidesMap[ride.driver.name].push(ride);
      } else {
        driverIdToRidesMap[ride.driver.name] = [ride];
      }
    }

    for (const [driverId, rides] of Object.entries(driverIdToRidesMap)) {
      await DriverModel.findOneAndUpdate(
        {
          name: driverId,
        },
        {
          alloted: true,
        },
      );
    }

    return res.status(200).json({
      driverIdToRidesMap: driverIdToRidesMap,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error retrieving rides");
  }
};

const setPickUpTimeForRidesAndDeptTimeForDrivers_POST = async (req, res) => {
  try {
    const { rides, drivers } = req.body;

    rides.forEach(async (ride) => {
      await RideModel.findByIdAndUpdate(ride.rideId, {
        pickUpOrDropTime: ride.pickUpOrDropTime,
      });
    });

    drivers.forEach(async (driver) => {
      await DriverModel.findOneAndUpdate(
        {
          name: driver.driverId,
        },
        {
          departureTime: driver.departureTime,
          link: driver.link,
        },
      );
    });

    return res.status(200).json("Pick up time set for slot");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error in setting pickup time for slot");
  }
};

export {
  login_POST,
  profile_GET,
  getAllRides_GET,
  getAllStudents_GET,
  getAllEvents_GET,
  getAllRidesByTime_POST,
  allocate_POST,
  setPickUpTimeForRidesAndDeptTimeForDrivers_POST,
};
