const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const ErrorResponse = require("../utils/ErrorResponse");
const { asyncHandler } = require("../middlewares/async");

// @desc                view post comments
//@route                GET /api/v1/posts/:postId/comments
// @access              public route
exports.getComments = asyncHandler(async (req, res, next) => {
  let comments = await Comment.find({
    post: req.params.postId,
  }).populate("user", ["image", "firstName", "lastName"]);
  if (!comments) {
    return next(new ErrorResponse("no comments found", 404));
  }
  res.json({ success: true, data: comments });
});

// @desc                create comment
//@route                POST /api/v1/posts/:postId/comments
// @access              public route
exports.postComment = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new ErrorResponse(`post not found`, 404));
  }
  let data = {
    message: req.body.comment,
    post: req.params.postId,
    user: req.user._id,
  };

  let newComment = await Comment.create(data);
  if (!newComment) {
    return next(new ErrorResponse(`error occured while saving your data`, 500));
  }
  res.json({ success: true, data });
});
