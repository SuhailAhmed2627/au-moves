import { SECRET_KEY } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import { DriverModel } from "../models/DriverModel.js";
import { RideModel } from "../models/RideModel.js";
import { getDriver } from "../utils/getDriver.js";

const login_POST = async (req, res) => {
  try {
    const { username, password } = req.body;
    const driver = await DriverModel.findOne({ username: username });
    if (!driver) {
      return res.json("Driver not found");
    }

    if (driver.password !== password) {
      return res.json("Password incorrect");
    }

    const token = jwt.sign({ id: driver._id, userType: "driver" }, SECRET_KEY);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

const profile_GET = async (req, res) => {
  try {
    const driverId = req.id; //getting back line 72
    const driver = await DriverModel.findById(driverId); //find student document from database with ID

    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    res.status(200).json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json("Driver not found");
  }
};

const getDriverRides_GET = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }
    // Get all the rides from the database
    const rides = await RideModel.find({
      driver: driver._id,
    }).populate("bookedBy", "names latitude longitude"); // Populate the bookedBy field with the names, latitude and longitude of the student who booked the ride.
    return res.status(200).json(rides);
  } catch (error) {
    console.log(error);
    res.status(500).json("Driver not found");
  }
};

const setDriverAvailability = async (driverId, availability) => {
  try {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      return false;
    }

    driver.available = availability;
    await driver.save();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getDriverStatus_GET = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }
    const status = {
      alloted: driver.alloted,
      available: driver.available,
      departureTime: driver.departureTime,
    }

    return res.status(200).json(status);
  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
};

const getRidesData_GET = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }
    const rides = await RideModel.find({
      driver: driver._id,
      completed: false,
    }).populate("bookedBy", "names username phone_number latitude longitude");

    const ridesData = rides.map((ride) => {
      return {
        _id: ride._id,
        pickedUpOrDropped: ride.pickedUpOrDropped,
        bookedBy: ride.bookedBy,
      }
    });

    return res.status(200).json({
      ridesData,
      toUni: rides[0].toUni,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
}

const startRide_GET = async (req, res) => {
  try {
    console.log("Start ride");
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    driver.available = false;
    await driver.save();

    return res.status(200).json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
}

const endRide_GET = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    await RideModel.updateMany({
      driver: driver._id,
      completed: false,
    }, {
      completed: true,
    });

    driver.available = true;
    driver.alloted = false;
    driver.departureTime = null;
    driver.link = null;
    await driver.save();

    return res.status(200).json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
}

const pickUpStudent_POST = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    const rideId = req.body.rideId;
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json("Ride not found");
    }

    ride.pickedUpOrDropped = true;
    await ride.save();

    const rides = await RideModel.find({
      driver: driver._id,
      completed: false,
    }).populate("bookedBy", "names username phone_number latitude longitude");

    const ridesData = rides.map((ride) => {
      return {
        _id: ride._id,
        pickedUpOrDropped: ride.pickedUpOrDropped,
        bookedBy: ride.bookedBy,
      }
    });

    return res.status(200).json(
      ridesData,
    );
  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
}

const getLink_GET = async (req, res) => {
  try {
    const driver = await getDriver(req);
    if (!driver) {
      return res.status(404).json("Driver not found");
    }

    return res.status(200).json({
      link: driver.link,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json("Some error occurred");
  }
}

export { endRide_GET, login_POST, profile_GET, getDriverRides_GET, setDriverAvailability, getDriverStatus_GET, getRidesData_GET, startRide_GET, pickUpStudent_POST, getLink_GET };
