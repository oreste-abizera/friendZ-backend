const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["public", "private"],
    default: "public",
    required: true,
  },
  text: {
    type: String,
  },
  message: String,
  photos: {
    type: [String],
  },
  tags: {
    type: [mongoose.Schema.ObjectId],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: [mongoose.Schema.ObjectId],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports.Post = mongoose.model("Post", PostSchema);
