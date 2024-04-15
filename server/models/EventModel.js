import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  event: String,
  time: Date,
  approved: Boolean,
  completed: Boolean,
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
  }, // The student who booked the event
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "drivers",
    default: null,
  },
});
const EventModel = mongoose.model("events", EventSchema);

export { EventModel };
