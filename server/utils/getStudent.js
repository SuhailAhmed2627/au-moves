import { StudentModel } from "../models/StudentModel.js";

/**
 * A function that returns a student object from the database.
 *
 * @param {Request & {id : string}} req - The request object with the id after going through the middleware.
 * @returns {Promise<HydratedDocument<StudentModel>>} A promise that resolves to a student object. Using await when calling this function will return a student object.
 */
const getStudent = async (req) => {
  const studentId = req.id; // The id is added to the request object by the middleware. In this line, we are extracting the id from the request object.
  const student = await StudentModel.findById(studentId); // Finding the student in the database using the id.
  return student;
};

export { getStudent };
