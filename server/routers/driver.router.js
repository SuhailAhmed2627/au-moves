import { endRide_GET, login_POST, profile_GET, getLink_GET, getDriverStatus_GET, getRidesData_GET, startRide_GET, pickUpStudent_POST } from "../controllers/driver.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { driverCheckMiddleware } from "../middlewares/driverCheck.js";

const driverRoutes = (app) => {
  app.post("/driver/login", login_POST);
  app.get(
    "/driver/profile",
    [authMiddleware, driverCheckMiddleware],
    profile_GET,
  );
  app.get(
    "/driver/status",
    [authMiddleware, driverCheckMiddleware],
    getDriverStatus_GET,
  );
  app.get(
    "/driver/ridesData",
    [authMiddleware, driverCheckMiddleware],
    getRidesData_GET,
  );
  app.get(
    "/driver/startRide",
    [authMiddleware, driverCheckMiddleware],
    startRide_GET,
  );
  app.get(
    "/driver/endRide",
    [authMiddleware, driverCheckMiddleware],
    endRide_GET,
  );
  app.post(
    "/driver/pickUpStudent",
    [authMiddleware, driverCheckMiddleware],
    pickUpStudent_POST,
  );
  app.get(
    "/driver/link",
    [authMiddleware, driverCheckMiddleware],
    getLink_GET,
  );
};

export { driverRoutes };
