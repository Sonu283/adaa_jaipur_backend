const express = require("express");
const {
  SignupUser,
  LoginUser,
  AllUsersDetail,
  addToCart,
  deleteFromCart,
  getCart,
} = require("../Controller/userController");

const router = express.Router();

router.post("/signup", SignupUser);
router.post("/login", LoginUser);

router.get("/allUser", AllUsersDetail);
router.post("/getCart", getCart);
router.post("/addToCart", addToCart);
router.post("/deleteFromCart", deleteFromCart);

module.exports = router;
