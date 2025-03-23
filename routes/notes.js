// server/routes/notes.js
const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Get all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific note by roomId
router.get("/:roomId", async (req, res) => {
  try {
    const note = await Note.findOne({ roomId: req.params.roomId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    roomId: req.body.roomId,
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a note
router.patch("/:roomId", async (req, res) => {
  try {
    const note = await Note.findOne({ roomId: req.params.roomId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.body.title) note.title = req.body.title;
    if (req.body.content) note.content = req.body.content;
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
