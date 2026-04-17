const express = require("express");
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  updateProgress,
} = require("../controllers/userController");

router.get( "/:username",          getProfile);
router.put( "/:username",          updateProfile);
router.post("/:username/progress", updateProgress);

module.exports = router;
