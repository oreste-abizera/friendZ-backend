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
//other routes
const CommentsRoute = require("./Comments");

//re-route to other routes
router.use("/:postId/comments", CommentsRoute);

router.route("/").post(protect, createPost).get(protect, getPosts);
router.route("/:id").get(protect, getSinglePost).put(protect, editPost);
router.route("/user/:id").get(protect, getUserPosts);
module.exports = router;
