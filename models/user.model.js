import mongoose, { Schema } from "mongoose";

const UserSchema = Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  profilePicture: { type: String, default: "default.jpg" },
  createdAt: { type: Date, default: Date.now },
  token: {
    type: String,
    default: "",
  },
});

export const User = mongoose.model("User", UserSchema);
