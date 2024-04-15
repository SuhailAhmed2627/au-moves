async function adminCheckMiddleware(req, res, next) {
  console.log("Checking if user is admin");
  if (req.userType !== "admin") {
    console.log("You are unauthorized");
    return res.status(401).json({ message: "You are unauthorized" });
  }
  next();
}

export { adminCheckMiddleware };
