import {
  book_POST,
  getAll_GET,
  getEvent_POST,
  approveEvent_POST,
  assignDriver_POST,
  getOpenEvents_GET,
  registerEvent_POST
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { studentCheckMiddleware } from "../middlewares/studentCheck.js";
import { secretaryCheckMiddleware } from "../middlewares/secretaryCheck.js";
import { adminCheckMiddleware } from "../middlewares/adminCheck.js";

const eventRoutes = (app) => {
  app.post(
    "/event/book",
    [authMiddleware, secretaryCheckMiddleware],
    book_POST,
  );
  app.get("/event/getAll", [authMiddleware, adminCheckMiddleware], getAll_GET);
  app.post(
    "/event/getEvent",
    [authMiddleware, adminCheckMiddleware],
    getEvent_POST,
  );
  app.post(
    "/event/register",
    [authMiddleware, studentCheckMiddleware],
    registerEvent_POST,
  );
  app.post(
    "/event/approve",
    [authMiddleware, adminCheckMiddleware],
    approveEvent_POST,
  );
  app.post(
    "/event/assignDriver",
    [authMiddleware, adminCheckMiddleware],
    assignDriver_POST,
  );
  app.get(
    "/event/open",
    [authMiddleware, studentCheckMiddleware],
    getOpenEvents_GET,
  );
};

export { eventRoutes };
