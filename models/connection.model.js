import mongoose, { Schema } from "mongoose";

const ConnectionSchema = Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status_accepted: {
    type: Boolean,
    default: null,
  },
});

export const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionSchema
);
