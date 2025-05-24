import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
});

const Liked = mongoose.model("Liked", LikeSchema);
export default Liked;
