import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  names: String,
  username: String,
  password: String,
  longitude: Number,
  latitude: Number,
  emirate: String,
  phone_number: String,
});
const StudentModel = mongoose.model("students", StudentSchema);

export { StudentModel };
