const { User } = require("../models/User");

exports.getUserUniqueness = async (user) => {
  let findEmail = await User.findOne({ email: user.email });
  if (findEmail) {
    return {
      unique: false,
      message: "Email already taken. Please try again with another email",
    };
  }

  return {
    unique: true,
  };
};

exports.checkValidUser = async (userId) => {
  let user = await User.findById(userId);
  if (!user) {
    return {
      valid: false,
    };
  }

  return {
    valid: true,
    user: user,
  };
};
