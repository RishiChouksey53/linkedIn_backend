import Post from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import httpStatus from "http-status";
import Liked from "../models/liked.model.js";

export const createPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });
    await post.save();
    return res.status(httpStatus.CREATED).json({ post: post });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate(
      "userId",
      "username name email profilePicture"
    );
    // if (!posts || posts.length === 0) {
    //   return res
    //     .status(httpStatus.NOT_FOUND)
    //     .json({ message: "posts not found" });
    // }
    return res.status(httpStatus.OK).json({ posts: posts });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  const { token, postId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }

    if (String(post.userId._id) !== String(user._id)) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "You are not the owner of this post" });
    }

    await Post.findByIdAndDelete(postId);

    return res
      .status(httpStatus.OK)
      .json({ message: "Post deleted", data: post });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, postId, body } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: body,
    });

    await comment.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Comment added", data: comment });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getCommentsByPost = async (req, res) => {
  const postId = req.query.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    const comments = await Comment.find({ postId: postId }).populate(
      "userId",
      "username name profilePicture"
    );
    return res
      .status(httpStatus.OK)
      .json({ message: "comment fetched", data: comments });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { token, commentId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "comment not found" });
    }

    if (String(comment.userId) !== String(user._id)) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "You are not the owner of this comment" });
    }
    await Comment.deleteOne({ _id: commentId });

    return res
      .status(httpStatus.OK)
      .json({ message: "comment deleted", data: comment });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// export const incrementLikes = async (req, res) => {
//   const { postId } = req.body;
//   try {
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res
//         .status(httpStatus.NOT_FOUND)
//         .json({ message: "Post not found" });
//     }

//     post.likes = post.likes + 1;
//     await post.save();

//     return res.status(httpStatus.OK).json({ message: "Post liked" });
//   } catch (error) {
//     return res
//       .status(httpStatus.INTERNAL_SERVER_ERROR)
//       .json({ message: error.message });
//   }
// };

export const handleLikePost = async (req, res) => {
  const { postId, userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const isLiked = await Liked.findOne({
      userId: userId,
      postId: postId,
    });
    if (isLiked) {
      await Liked.deleteOne({ userId, postId });
      post.likes = Math.max(post.likes - 1, 0);
      await post.save();
      return res.status(httpStatus.OK).json({ message: "Post disliked"});
    } else {
      const newLike = new Liked({
        userId,
        postId,
      });
      await newLike.save();
      post.likes += 1;
      await post.save();
      return res.status(httpStatus.OK).json({ message: "Post liked"});
    }
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
