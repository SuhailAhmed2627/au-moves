import { AdminModel } from "../models/AdminModel.js";

/**
 * A function that returns a admin object from the database.
 *
 * @param {Request & {id : string}} req - The request object with the id after going through the middleware.
 * @returns {Promise<HydratedDocument<AdminModel>>} A promise that resolves to a admin object. Using await when calling this function will return a admin object.
 */
const getAdmin = async (req) => {
  const adminId = req.id; // The id is added to the request object by the middleware. In this line, we are extracting the id from the request object.
  const admin = await AdminModel.findById(adminId); // Finding the admin in the database using the id.
  return admin;
};

export { getAdmin };
