import {
  book_POST,
  getAll_GET,
  getEvent_POST,
  approveEvent_POST,
  assignDriver_POST,
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { studentCheckMiddleware } from "../middlewares/studentCheck.js";

const eventRoutes = (app) => {
  app.post("/event/book", [authMiddleware, studentCheckMiddleware], book_POST);
  app.get(
    "/event/getAll",
    [authMiddleware, studentCheckMiddleware],
    getAll_GET,
  );
  app.post(
    "/event/getEvent",
    [authMiddleware, studentCheckMiddleware],
    getEvent_POST,
  );
  app.post(
    "/event/approve",
    [authMiddleware, studentCheckMiddleware],
    approveEvent_POST,
  );
  app.post(
    "/event/assignDriver",
    [authMiddleware, studentCheckMiddleware],
    assignDriver_POST,
  );
};

export { eventRoutes };
