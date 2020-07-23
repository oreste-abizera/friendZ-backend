const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "add message"],
  },
  to: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
  from: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    default: "unread",
    enum: ["unread", "read"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports.Message = new mongoose.model("Message", MessageSchema);
