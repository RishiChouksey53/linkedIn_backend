import mongoose, { Schema } from "mongoose";


const CommentSchema = Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }, 
    body: {
        type: String,
        required: true,
    }
})

export const Comment = mongoose.model("Comment", CommentSchema)