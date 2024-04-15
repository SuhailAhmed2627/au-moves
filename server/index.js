import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import { scheduleJob } from "node-schedule";

import { studentRoutes } from "./routers/student.router.js";
import { driverRoutes } from "./routers/driver.router.js";
import { rideRoutes } from "./routers/ride.router.js";
import { adminRoutes } from "./routers/admin.router.js";
import { secretaryRoutes } from "./routers/secretary.router.js";
import { eventRoutes } from "./routers/event.router.js";
import { allocateStudentsToDrivers } from "./utils/allocate.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

mongoose.connect("mongodb://127.0.0.1:27017/au_moves");

studentRoutes(app);
driverRoutes(app);
rideRoutes(app);
adminRoutes(app);
secretaryRoutes(app);
eventRoutes(app);

// This will run the allocateStudentsToDrivers function at 00:05, 13:05, 16:05, and 18:05 on Monday, Tuesday, Wednesday, Thursday, and Friday.
// 00:05 -> schedules for all the morning rides (8:00, 10:00, 12:00 times of arrival of students at campus)
// 13:05 -> schedules for ride at 15:00 from campus to home
// 16:05 -> schedules for ride at 18:00 from campus to home
// 18:05 -> schedules for ride at 20:00 from campus to home
const allocateJob = scheduleJob("0 5 0,13,16,18 * * 1,2,3,4,5", async () => {
  allocateStudentsToDrivers();
});

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
