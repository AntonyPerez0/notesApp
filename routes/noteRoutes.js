const express = require("express");
const router = express.Router();
const {
  createNote,
  getAllUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
  adminUpdateNote,
  adminDeleteNote,
} = require("../controllers/noteController");
const { protect, authorizeAdmin } = require("../middleware/authMiddleware");

router.route("/").post(protect, createNote).get(protect, getAllUserNotes);

router
  .route("/:noteId")
  .get(protect, getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

// Admin specific routes for notes
router.put("/admin/:noteId", protect, authorizeAdmin, adminUpdateNote);
router.delete("/admin/:noteId", protect, authorizeAdmin, adminDeleteNote);

module.exports = router;
