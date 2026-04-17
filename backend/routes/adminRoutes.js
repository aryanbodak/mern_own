const express      = require("express");
const router       = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAllUsers,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/adminController");

router.get(   "/users",        requireAdmin, getAllUsers);
router.post(  "/courses",      requireAdmin, createCourse);
router.put(   "/courses/:id",  requireAdmin, updateCourse);
router.delete("/courses/:id",  requireAdmin, deleteCourse);

module.exports = router;
