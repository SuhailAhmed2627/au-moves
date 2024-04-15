import {
  login_POST,
  profile_GET,
  getAllEvents_GET,
  createEvent_POST,
} from "../controllers/secretary.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { secretaryCheckMiddleware } from "../middlewares/secretaryCheck.js";

const secretaryRoutes = (app) => {
  app.post("/secretary/login", login_POST);
  app.get(
    "/secretary/profile",
    [authMiddleware, secretaryCheckMiddleware],
    profile_GET,
  );
  app.get(
    "/secretary/events",
    [authMiddleware, secretaryCheckMiddleware],
    getAllEvents_GET,
  );
  app.post(
    "/secretary/events",
    [authMiddleware, secretaryCheckMiddleware],
    createEvent_POST,
  );
};

export { secretaryRoutes };
