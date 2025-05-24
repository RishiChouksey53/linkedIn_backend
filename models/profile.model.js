import mongoose, { Schema } from "mongoose";

const EducationSchema = Schema({
  school: {
    type: String,
    default: "",
  },
  degree: {
    type: String,
    default: "",
  },
  fieldOfStudy: {
    type: String,
    default: "",
  },
});

const WorkSchema = Schema({
  company: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "",
  },
  years: {
    type: String,
    default: "",
  },
});

const ProfileSchema = Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bio: { type: String, default: "" },
  currentPost: { type: String, default: "" },
  pastWork: { type: [WorkSchema], default: [] },
  education: { type: [EducationSchema], default: [] },
});

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;
