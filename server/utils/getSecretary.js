import { SecretaryModel } from "../models/SecretaryModel.js";
/**
 * A function that returns a secretary object from the database.
 *
 * @param {Request & {id : string}} req - The request object with the id after going through the middleware.
 * @returns {Promise<HydratedDocument<SecretaryModel>>} A promise that resolves to a secretary object. Using await when calling this function will return a secretary object.
 */
const getSecretary = async (req) => {
  const secretaryId = req.id; // The id is added to the request object by the middleware. In this line, we are extracting the id from the request object.
  const secretary = await SecretaryModel.findById(secretaryId); // Finding the secretary in the database using the id.
  return secretary;
};

export { getSecretary };
