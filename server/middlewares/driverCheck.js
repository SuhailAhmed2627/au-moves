async function driverCheckMiddleware(req, res, next) {
  if (req.userType !== "driver") {
    return res.status(401).json({ message: "You are unauthorized" });
  }
  next();
}

export { driverCheckMiddleware };
