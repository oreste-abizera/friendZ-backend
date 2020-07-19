const express = require("express");
const {
  getSinglePost,
  createPost,
  getPosts,
  getUserPosts,
  editPost,
} = require("../controllers/Posts");
const { protect } = require("../middlewares/Auth");

const router = express.Router();
router.route("/").post(protect, createPost).get(protect, getPosts);
router.route("/:id").get(protect, getSinglePost).put(protect, editPost);
router.route("/user/:id").get(protect, getUserPosts);
module.exports = router;
