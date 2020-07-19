const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "add a comment"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, "user is required"],
    ref: "User",
  },
  post: {
    type: mongoose.Schema.ObjectId,
    required: [true, "add a post"],
    ref: "Post",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports.Comment = mongoose.model("Comment", CommentSchema);
