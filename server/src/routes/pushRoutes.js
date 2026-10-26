const express = require("express");
const { optionalAuth } = require("../middleware/auth");
const { getPublicKey, subscribe, unsubscribe } = require("../controllers/pushController");

const router = express.Router();

router.get("/vapid-public-key", getPublicKey);
router.post("/subscribe", optionalAuth, subscribe);
router.post("/unsubscribe", optionalAuth, unsubscribe);

module.exports = router;
