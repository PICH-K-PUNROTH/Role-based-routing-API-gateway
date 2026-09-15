const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

module.exports = mongoose.model("User", userSchema);