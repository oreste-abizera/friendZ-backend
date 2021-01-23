const { asyncHandler } = require("../middlewares/async");
const { User } = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const { Message } = require("../models/Message");
const { unlock } = require("../routes/Messages");

// @desc                view messages
//@route                GET /api/v1/users/:userId/messages
// @access              private route
exports.getMessages = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userId);
  if (!user) {
    return next(new ErrorResponse("user not found", 404));
  }

  let messages = await Message.find().populate("to").populate("from");

  messages = messages.filter(
    (item) =>
      (item.to._id.toString() === req.params.userId.toString() &&
        item.from._id.toString() === req.user._id.toString()) ||
      (item.from._id.toString() === req.params.userId.toString() &&
        item.to._id.toString() === req.user._id.toString())
  );

  res.json({
    success: true,
    data: messages,
  });
});

// @desc                send message
//@route                POST /api/v1/users/:userId/messages
// @access              private route
exports.sendMessage = asyncHandler(async (req, res, next) => {
  let data = { ...req.body };
  data.from = req.user._id;
  data.to = req.params.userId;

  let message = await Message.create(data);
  if (!message) {
    return next(new ErrorResponse("Error occured", 404));
  }
  res.json({
    success: true,
    data: message,
  });
});

// @desc                read messages
//@route                PUT /api/v1/users/:userId/messages
// @access              private route
exports.readMessages = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userId);
  if (!user) {
    return next(new ErrorResponse("user not found", 404));
  }
  let update = await Message.updateMany(
    { to: req.user._id, from: req.params.userId },
    { status: "read" }
  );
  if (!update) {
    return new ErrorResponse("Error occured while updating status");
  }
  console.log(update);

  res.json({
    success: true,
  });
});

// @desc                get chats
//@route                GET /api/v1/users/me/messages/chats
// @access              private route
exports.getChats = asyncHandler(async (req, res, next) => {
  let messages = await Message.find().populate("to").populate("from");
  messages = messages.filter(
    (item) =>
      item.from._id.toString() === req.user._id.toString() ||
      item.to._id.toString() === req.user._id.toString()
  );
  let tempChats = [];
  let chats = new Set();
  for (let i = 0; i < messages.length; i++) {
    const element = messages[i];
    let finalChat =
      element.to._id.toString() !== req.user._id.toString()
        ? element.to._id
        : element.from._id;
    chats.add(finalChat.toString());
  }
  tempChats = [...chats];
  for (let i = 0; i < tempChats.length; i++) {
    const element = await User.findById(tempChats[i]);
    tempChats[i] = element;
  }
  tempChats = tempChats.reverse();

  res.json({
    success: true,
    data: tempChats,
  });
});
