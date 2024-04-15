import { SECRET_KEY } from "../utils/auth.js";
import jwt from "jsonwebtoken";

async function authMiddleware(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    console.log(1);
    return res.status(401).json({ message: "You are unauthorized" });
  }
  const payload = jwt.verify(token, SECRET_KEY);

  if (!payload) {
    console.log(2);
    return res.status(401).json({ message: "You are unauthorized" });
  }

  const id = payload.id;
  if (!id) {
    console.log(3);
    return res.status(401).json({ message: "You are unauthorized" });
  }
  req.id = id;
  req.userType = payload.userType; // Add user type to the request

  next();
}

export { authMiddleware };
