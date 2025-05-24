import { Router } from "express";
import multer from "multer";
import {
  commentPost,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getCommentsByPost,
  handleLikePost,
  // incrementLikes,
} from "../controllers/posts.controller.js";

const postRoutes = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

postRoutes.post("/create_post", upload.single("media"), createPost);
postRoutes.get("/get_all_posts", getAllPosts);
postRoutes.delete("/delete_post", deletePost);
postRoutes.post("/comment_post", commentPost);
postRoutes.get("/get_comments_by_post", getCommentsByPost);
postRoutes.delete("/delete_comment", deleteComment);
// postRoutes.post("/increment_likes", incrementLikes);
postRoutes.post("/handle_like_post", handleLikePost);
export default postRoutes;
