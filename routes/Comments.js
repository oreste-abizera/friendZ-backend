const express = require("express");
const { postComment, getComments } = require("../controllers/Comments");
const { protect } = require("../middlewares/Auth");
const Router = express.Router({ mergeParams: true });

Router.route("/").post(protect, postComment).get(protect, getComments);

module.exports = Router;
