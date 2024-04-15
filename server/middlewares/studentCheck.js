async function studentCheckMiddleware(req, res, next) {
  if (req.userType !== "student") {
    return res.status(401).json({ message: "You are unauthorized" });
  }
  next();
}

export { studentCheckMiddleware };
