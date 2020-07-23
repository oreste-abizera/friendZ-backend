const express = require("express");
const {
  getSingleUser,
  getLatestUsers,
  getUsers,
} = require("../controllers/Users");
const { protect } = require("../middlewares/Auth");
const router = express.Router();

//other routes
const MessagesRoute = require("./Messages");

//re-route to other routes
router.use("/:userId/messages", MessagesRoute);

router.route("/").get(protect, getUsers);
router.route("/latest").get(protect, getLatestUsers);
router.route("/:id").get(getSingleUser);

module.exports = router;
