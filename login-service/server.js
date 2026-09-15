require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./dbConnect");
const User = require("./Schema");

const app = express();
app.use(express.json());
connectDB();

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "email, password and role are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password or role" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password or role" });
    }

    if (user.role !== role) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password or role" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ success: true, message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Login Service is running"));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Login Service running on port ${PORT}`));