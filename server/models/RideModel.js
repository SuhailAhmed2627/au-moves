import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  time: Date,
  toUni: Boolean,
  completed: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  }, // The student who booked the ride, This is how we will know which student booked the ride.
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
    default: null,
  },
  pickedUpOrDropped: {
    type: Boolean,
    default: false,
  },
  pickUpOrDropTime: {
    type: Date,
    default: null,
  }
});
const RideModel = mongoose.model("rides", RideSchema);

export { RideModel };
