require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("./dbConnect");
const User = require("./Schema");

const app = express();
app.use(express.json());
connectDB();

app.post("/register/userregister", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password and role are required" });
    }
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be either 'admin' or 'user'" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Registration Service is running"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Registration Service running on port ${PORT}`));