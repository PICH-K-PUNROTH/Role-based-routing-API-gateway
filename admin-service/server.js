require("dotenv").config();
const express = require("express");
const connectDB = require("./dbConnect");
const User = require("./Schema");

const app = express();
app.use(express.json());
connectDB();

app.use((req, res, next) => {
  req.userRole = req.headers["x-user-role"];
  req.userEmail = req.headers["x-user-email"];
  next();
});

app.get("/admin/searchuser", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "query param (name or email) is required" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    if (!users.length) {
      return res.status(404).json({ success: false, message: "No user found" });
    }
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/admin/viewalluser", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.delete("/admin/deluser", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "email is required" });
    }

    const deletedUser = await User.findOneAndDelete({ email: email.toLowerCase() });
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/", (req, res) => res.send("Admin Service is running"));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));