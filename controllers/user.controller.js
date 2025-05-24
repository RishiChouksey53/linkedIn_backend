import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import Profile from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import { ConnectionRequest } from "../models/connection.model.js";

const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);
  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`<-- Details -->`);
  doc.fontSize(14).text(`--------------------------`);
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`CurrentPost: ${userData.currentPost}`);
  doc.fontSize(14).text(`--------------------------`);
  doc.fontSize(14).text(`<-- PastWork -->`);
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`- Company: ${work.company}`);
    doc.fontSize(14).text(`- Position: ${work.position}`);
    doc.fontSize(14).text(`- Experience: ${work.years}`);
    doc.moveDown(0.5);
  });
  doc.fontSize(14).text(`--------------------------`);
  doc.fontSize(14).text(`<-- Education -->`);
  userData.education.forEach((data) => {
    doc.fontSize(14).text(`- School: ${data.school}`);
    doc.fontSize(14).text(`- Degree: ${data.degree}`);
    doc.moveDown(0.5);
    doc.fontSize(14).text(`- FieldOfStudy: ${data.fieldOfStudy}`);
    doc.moveDown(0.5);
  });

  doc.end();
  return outputPath;
};

export const register = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const profile = new Profile({
      userId: newUser._id,
    });
    await profile.save();
    return res
      .status(httpStatus.CREATED)
      .json({ message: "Registration is Successfull, Please login in" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Password" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });
    return res.status(httpStatus.OK).json({ token: token });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    user.profilePicture = req.file.filename;
    await user.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Profile Picture Updated" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { token, ...newUserData } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ message: "User already exists" });
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Profile Updated Successfully!" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    if (!userProfile) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "UserProfile not found" });
    }
    return res.status(httpStatus.OK).json({ userProfile });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  const { token, ...newProfileData } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id });
    if (!userProfile) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "UserProfile not found" });
    }
    Object.assign(userProfile, newProfileData);
    await userProfile.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "UserProfile Updated Successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getAllUsersProfile = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate(
      "userId",
      "name username email profilePicture"
    );
    if (!profiles || profiles.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Profiles Not found" });
    }
    return res
      .status(httpStatus.OK)
      .json({ message: "profiles fetched", data: profiles });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  const userId = req.query.id;
  try {
    const userProfile = await Profile.findOne({ userId: userId }).populate(
      "userId",
      "name username email profilePicture"
    );
    const outputPath = await convertUserDataToPDF(userProfile);
    console.log(userProfile);
    return res.json({ message: outputPath });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "connectionUser not found" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Connection request already send" });
    }
    const newRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await newRequest.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Connection Request send Successfully!" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getConnectionRequestsSend = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    if (!connections || connections.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "No connection requests send" });
    }

    return res
      .status(httpStatus.OK)
      .json({ message: "Connection requests fetched", data: connections });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getConnectionRequestsReceived = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    if (!connections || connections.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "No connection requests received" });
    }

    return res
      .status(httpStatus.OK)
      .json({ message: "Connection requests fetched", data: connections });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      _id: requestId,
    }).populate("userId", "name username email profilePicture");

    if (!connections || connections.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "No connection requests received" });
    }
    if (action_type === "accept") {
      connections.status_accepted = true;
    } else {
      connections.status_accepted = false;
    }
    await connections.save();
    await connections.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Connection request Status Updated" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username is required" });
  }
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );
    if (!userProfile) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "UserProfile not found" });
    }
    return res.status(httpStatus.OK).json({ userProfile });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
