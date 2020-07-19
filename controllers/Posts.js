const { Post } = require("../models/Post");
const { User } = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const { asyncHandler } = require("../middlewares/async");
const path = require("path");

// @desc                get single user
//@route                GET /api/v1/posts
// @access              public route
exports.getPosts = asyncHandler(async (req, res, next) => {
  let posts = (await Post.find().populate("user")).reverse();
  if (!posts) {
    return next(new ErrorResponse("posts not found", 404));
  }
  res.send({
    success: true,
    data: posts,
  });
});

// @desc                get single post
//@route                GET /api/v1/posts/:id
// @access              public route
exports.getSinglePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id).populate("user");
  if (!post) {
    return next(new ErrorResponse("post not found", 404));
  }
  res.send({
    success: true,
    data: post,
  });
});

// @desc                create post
//@route                POST /api/v1/posts
// @access              public route
exports.createPost = asyncHandler(async (req, res, next) => {
  let data = { ...req.body, user: req.user.id };
  if (!data.tags) {
    data.tags = undefined;
  } else {
    data.tags = [...data.tags.split(",")];
  }

  if (req.files) {
    if (req.files.file) {
      //upload an image to the server
      let file = req.files.file;

      if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an image file", 400));
      }

      if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse("File too large", 400));
      }

      file.name = `post_${req.user.id}_${Date.now()}${
        path.parse(file.name).ext
      }`;

      file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
          return next(
            new ErrorResponse("Error occured while uploading an image")
          );
        } else {
          data = { ...data, photos: [file.name] };
          await createpost(data, res, next);
        }
      });
    }
  } else {
    await createpost(data, res, next);
  }
});

const createpost = async (data, res, next) => {
  if (!data.text && !data.photos) {
    return next(new ErrorResponse("Add post description or image", 400));
  }
  let newPost = await Post.create(data);
  if (!newPost) {
    return next(
      new ErrorResponse("Error occured while creating your post", 500)
    );
  }
  res.json({
    success: true,
    data: newPost,
  });
};

// @desc                get user posts
//@route                GET /api/v1/posts/user/:id
// @access              public route
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("user not found", 404));
  }

  let posts = (await Post.find().populate("user")).reverse();
  let userPosts = [];
  userPosts = posts.filter((item) => {
    return (
      item.tags.includes(user._id) ||
      item.user._id.toString() === user._id.toString()
    );
  });
  res.send({
    success: true,
    data: userPosts,
  });
});

// @desc                edit post
//@route                PUT /api/v1/posts/:id
// @access              public route
exports.editPost = asyncHandler(async (req, res, next) => {
  let post = await Post.findOne({ _id: req.params.id, user: req.user.id });
  if (!post) {
    return next(new ErrorResponse("post not found", 404));
  }
  let { photos, user, ...updates } = req.body;
  let updatePost = await Post.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatePost) {
    return next(
      new ErrorResponse("Error occured while saving your changes", 500)
    );
  }

  res.send({
    success: true,
    data: updatePost,
  });
});
