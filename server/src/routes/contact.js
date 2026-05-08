const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", contactController.submitRequest);
router.get("/", contactController.getAllRequests);
router.post("/:id/reply", contactController.replyToRequest);
router.delete("/:id", contactController.deleteRequest);

module.exports = router;
