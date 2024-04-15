import { DriverModel } from "../models/DriverModel.js";

/**
 * A function that returns a driver object from the database.
 *
 * @param {Request & {id : string}} req - The request object with the id after going through the middleware.
 * @returns {Promise<HydratedDocument<DriverModel>>} A promise that resolves to a driver object. Using await when calling this function will return a driver object.
 */
const getDriver = async (req) => {
  const driverId = req.id; // The id is added to the request object by the middleware. In this line, we are extracting the id from the request object.
  const driver = await DriverModel.findById(driverId); // Finding the driver in the database using the id.
  return driver;
};

export { getDriver };
