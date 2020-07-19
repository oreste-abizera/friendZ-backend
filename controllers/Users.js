const { User } = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const { asyncHandler } = require("../middlewares/async");

// @desc                get all users
//@route                GET /api/v1/users
// @access              public route
exports.getUsers = asyncHandler(async (req, res, next) => {
  let users = await User.find();
  if (!users) {
    return next(new ErrorResponse("Users not found", 404));
  }
  res.send({
    success: true,
    data: users,
  });
});

// @desc                get single user
//@route                GET /api/v1/users/:id
// @access              public route
exports.getSingleUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  res.send({
    success: true,
    data: user,
  });
});

// @desc                get latest users
//@route                GET /api/v1/users/latest
// @access              public route
exports.getLatestUsers = asyncHandler(async (req, res, next) => {
  let users = await (await User.find()).reverse().slice(0, 12);
  if (!users) {
    return next(new ErrorResponse("Users not found", 404));
  }
  res.send({
    success: true,
    data: users,
  });
});
