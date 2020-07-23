const express = require("express");
const { protect } = require("../middlewares/Auth");
const {
  getMessages,
  sendMessage,
  getChats,
  readMessages,
} = require("../controllers/Messages");
const Router = express.Router({ mergeParams: true });

Router.route("/")
  .get(protect, getMessages)
  .post(protect, sendMessage)
  .put(protect, readMessages);
Router.route("/chats").get(protect, getChats);

module.exports = Router;
