async function secretaryCheckMiddleware(req, res, next) {
  if (req.userType !== "secretary") {
    return res.status(401).json({ message: "You are unauthorized" });
  }
  next();
}

export { secretaryCheckMiddleware };
