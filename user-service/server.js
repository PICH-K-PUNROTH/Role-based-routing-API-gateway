require("dotenv").config();
const express = require("express");
const connectDB = require("./dbConnect");
const User = require("./Schema");

const app = express();
app.use(express.json());
connectDB();

app.use((req, res, next) => {
  req.userEmail = req.headers["x-user-email"];
  req.userRole = req.headers["x-user-role"];
  next();
});

app.get("/user/viewprofile", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.userEmail }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.put("/user/updateprofile", async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;

    const updatedUser = await User.findOneAndUpdate(
      { email: req.userEmail },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

app.get("/", (req, res) => res.send("User Service is running"));

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));