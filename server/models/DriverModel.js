import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  number: String,
  number_plate: String,
  alloted: {
    type: Boolean,
    default: false,
  },
  departureTime: {
    type: Date,
    default: null,
  },
  available: {
    type: Boolean,
    default: true,
  },
  link: {
    type: String,
    default: null,
  },
});
const DriverModel = mongoose.model("drivers", DriverSchema);

export { DriverModel };
