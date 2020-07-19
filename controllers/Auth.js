const { User } = require("../models/User");
const { Post } = require("../models/Post");
const { hashPassword } = require("../utils/hash.js");
const { getUserUniqueness, checkValidUser } = require("../utils/functions");
const ErrorResponse = require("../utils/ErrorResponse");
const { asyncHandler } = require("../middlewares/async");
const path = require("path");

// @desc                create new user
//@route                POST /api/v1/auth/register
// @access              public route
exports.register = asyncHandler(async (req, res, next) => {
  //create user
  let newUser = { ...req.body };

  if (newUser.gender) newUser.gender = newUser.gender.toLowerCase();
  if (!newUser.password) {
  }
  if (newUser.password) newUser.password = await hashPassword(newUser.password);

  //@check uniqueness of the user details
  let checkUnique = await getUserUniqueness(newUser);
  if (checkUnique.unique === false) {
    return next(new ErrorResponse(checkUnique.message, 400));
  }

  newUser = await User.create(newUser);

  sendTokenResponse(newUser, 200, res);

  //end of create user
});

// @desc                login user
//@route                GET /api/v1/auth/login
// @access              private route
exports.login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;
  let user = await User.findOne({ email: identifier }).select("+password");

  if (user) {
    if (!(await user.comparePasswords(password))) {
      user = null;
    }
  }

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);

  //end of user login
});

//get token from model, set cookies and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc                get loggedin user
//@route                POST /api/v1/auth/me
// @access              private route
exports.getMe = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc                update logged in user details
//@route                PUT /api/v1/auth/updateProfile
// @access              private route
exports.updateProfile = asyncHandler(async (req, res, next) => {
  let { password, ...rest } = req.body;
  let user = await User.findByIdAndUpdate(req.user.id, rest, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc                update logged in user password
//@route                PUT /api/v1/auth/updatePassword
// @access              private route
exports.updatePassword = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select("+password");
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(
      new ErrorResponse(`add current password and new password`, 400)
    );
  }

  if (newPassword.length < 6) {
    return next(
      new ErrorResponse(`new password must be at least 6 characters`, 400)
    );
  }
  if (!(await user.comparePasswords(currentPassword))) {
    return next(new ErrorResponse(`invalid password`, 400));
  }

  if (user.password) user.password = await hashPassword(newPassword);
  user.save();
  sendTokenResponse(user, 200, res);
});

// @desc                update picture
//@route                PUT /api/v1/auth/updatePicture/:type
// @access              private route
exports.updateProfilePicture = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 400));
  }

  if (req.params.type !== "profile" && req.params.type !== "cover") {
    return next(new ErrorResponse("something went wrong", 400));
  }

  if (!req.files) {
    return next(new ErrorResponse("Please add an image", 400));
  }

  let file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse("File too large", 400));
  }

  file.name =
    req.params.type === "cover"
      ? `cover_${user._id}_${Date.now()}${path.parse(file.name).ext}`
      : `photo_${user._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse("Error occured while uploading an image"));
    } else {
      let updates =
        req.params.type === "cover"
          ? { cover: file.name }
          : { image: file.name };
      let updateUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!updateUser) {
        return next(
          new ErrorResponse("Error occured while saving your data", 500)
        );
      } else {
        createpost(
          req.params.type,
          { fileName: file.name, ...req.body },
          req.user.id
        );
      }
    }
  });

  res.json({
    success: true,
  });
});

const createpost = async (type, info, user) => {
  let message;
  if (type === "cover") {
    message = "updated cover photo";
  } else if (type === "profile") {
    message = "updated profile picture";
  }
  let data = { photos: [info.fileName], user: user, message, ...info };
  console.log(data);
  let createdPost = await Post.create(data);
  if (!createdPost) {
    console.log("error occured while creating post".red);
  }
};
