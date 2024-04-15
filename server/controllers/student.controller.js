import { SECRET_KEY } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import { StudentModel } from "../models/StudentModel.js";

const login_POST = async (req, res) => {
  try {
    const { username, password } = req.body;
    const student = await StudentModel.findOne({ username: username });
    if (!student) {
      return res.json("Student not found");
    }

    if (student.password !== password) {
      return res.json("Password incorrect");
    }

    const token = jwt.sign(
      { id: student._id, userType: "student" },
      SECRET_KEY,
    ); //payload: { studentId: student._id }
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

const profile_GET = async (req, res) => {
  try {
    const studentId = req.id; //getting back line 72
    const student = await StudentModel.findById(studentId); //find student document from database with ID

    if (!student) {
      return res.status(404).json("Student not found");
    }

    res.status(200).json(student);
  } catch (error) {
    console.log(error);
    res.status(500).json("Student not found");
  }
};

export { login_POST, profile_GET };
