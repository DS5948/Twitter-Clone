import mongoose from "mongoose";
import Post from "./models/post.model.js";
import Comment from "./models/comment.model.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

async function migrateComments() {
    try {
        const posts = await Post.find();

  for (const post of posts) {
    const newCommentIds = [];

    for (const oldComment of post.comments) {
      const newComment = new Comment({
        text: oldComment.text,
        user: oldComment.user,
        post: post._id,
        createdAt: oldComment.createdAt,
        updatedAt: oldComment.updatedAt,
      });

      await newComment.save({ timestamps: false });

      newCommentIds.push(newComment._id);
    }

    // Update post to point to new comment IDs
    post.comments = newCommentIds;
    await post.save();
  }

  console.log("Migration complete.");
  process.exit();
    } catch (error) {
        console.error("Error during migration: ",error)
    } finally {
        mongoose.disconnect();
    }
}

migrateComments()
