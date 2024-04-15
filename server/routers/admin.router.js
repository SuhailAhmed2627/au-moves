import {
  login_POST,
  profile_GET,
  getAllRides_GET,
  getAllStudents_GET,
  getAllEvents_GET,
  getAllRidesByTime_POST,
  allocate_POST,
  setPickUpTimeForRidesAndDeptTimeForDrivers_POST
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { adminCheckMiddleware } from "../middlewares/adminCheck.js";

const adminRoutes = (app) => {
  app.post("/admin/login", login_POST);
  app.get(
    "/admin/profile",
    [authMiddleware, adminCheckMiddleware],
    profile_GET,
  );
  app.get(
    "/admin/rides",
    [authMiddleware, adminCheckMiddleware],
    getAllRides_GET,
  );
  app.get(
    "/admin/students",
    [authMiddleware, adminCheckMiddleware],
    getAllStudents_GET,
  );
  app.get(
    "/admin/events",
    [authMiddleware, adminCheckMiddleware],
    getAllEvents_GET,
  );
  app.post(
    "/admin/getRidesByTime",
    [authMiddleware, adminCheckMiddleware],
    getAllRidesByTime_POST
  )
  app.post(
    "/admin/allocate",
    [authMiddleware, adminCheckMiddleware],
    allocate_POST
  )
  app.post(
    "/admin/setPickUpTimeForRidesAndDeptTimeForDrivers",
    [authMiddleware, adminCheckMiddleware],
    setPickUpTimeForRidesAndDeptTimeForDrivers_POST
  )
};

export { adminRoutes };
