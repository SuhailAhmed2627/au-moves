import {
  book_POST,
  getAll_GET,
  deleteRide_POST,
  completeRide_POST,
  createRide_POST,
} from "../controllers/ride.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { studentCheckMiddleware } from "../middlewares/studentCheck.js";

const rideRoutes = (app) => {
  app.post("/ride/book", authMiddleware, studentCheckMiddleware, book_POST);
  app.get("/ride/getAll", authMiddleware, studentCheckMiddleware, getAll_GET);
  app.post(
    "/ride/delete",
    authMiddleware,
    studentCheckMiddleware,
    deleteRide_POST,
  );
  app.post(
    "/ride/complete",
    authMiddleware,
    studentCheckMiddleware,
    completeRide_POST,
  );
  app.post(
    "/ride/create",
    createRide_POST,
  );
};

export { rideRoutes };
