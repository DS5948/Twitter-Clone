import mongoose from "mongoose";
import Post from "./models/post.model.js";
import Comment from "./models/comment.model.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

export default async function migrateComments() {
  try {
    const alreadyMigrated = await Comment.estimatedDocumentCount();
    if (alreadyMigrated > 0) {
      console.log("Migration already done. Skipping...");
      return;
    }

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

      post.comments = newCommentIds;
      await post.save();
    }

    console.log("Migration complete.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    mongoose.disconnect();
  }
}

