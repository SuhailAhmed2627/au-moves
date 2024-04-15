import { login_POST, profile_GET } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { studentCheckMiddleware } from "../middlewares/studentCheck.js";

const studentRoutes = (app) => {
  app.post("/login", login_POST);
  app.get("/profile", [authMiddleware, studentCheckMiddleware], profile_GET);
};

export { studentRoutes };
