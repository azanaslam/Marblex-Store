const express = require("express");
const { auth } = require("../middleware/auth");
const { register, login, getMyProfile, updateMyProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

module.exports = router;
