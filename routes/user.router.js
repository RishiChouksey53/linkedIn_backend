import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUsersProfile,
  getConnectionRequestsReceived,
  getConnectionRequestsSend,
  getUserAndProfile,
  getUserProfileAndUserBasedOnUsername,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  uploadProfilePicture,
} from "../controllers/user.controller.js";
import multer from "multer";
const userRoutes = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);
userRoutes.post("/update_user_profile", updateUserProfile);
userRoutes.get("/get_user_and_profile", getUserAndProfile);
userRoutes.post("/update_profile_data", updateProfileData);
userRoutes.get("/get_all_users_profile", getAllUsersProfile);
userRoutes.get("/download_profile", downloadProfile);
userRoutes.post("/sent_connection_request", sendConnectionRequest);
userRoutes.get("/get_connection_requests_send", getConnectionRequestsSend);
userRoutes.get(
  "/get_connection_requests_received",
  getConnectionRequestsReceived
);
userRoutes.get(
  "/get_profile_based_on_username/",
  getUserProfileAndUserBasedOnUsername
);
userRoutes.post("/accept_connection_request", acceptConnectionRequest);

export default userRoutes;
