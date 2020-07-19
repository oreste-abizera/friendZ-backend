const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  dateOfBirth: { type: Date },
  location: { type: String },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  gender: { type: String, enum: ["male", "female"] },
  password: {
    type: String,
    minlength: [6, "Password has to be at least 6 characters"],
    required: [true, "password is required"],
    select: false,
  },
  phoneNumber: {
    type: String,
  },
  image: { type: String, default: "avatar.jpg" },
  cover: String,
  skills: { type: String },
  education: { type: String },
  notes: { type: String },
  occupation: String,
  resetPasswordToken: String,
  resetPasswordExpire: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//sign Jwt
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

//match password
UserSchema.methods.comparePasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports.User = User;
