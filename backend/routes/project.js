
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

// Get all projects for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Create a new project (limit 4 per user)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const existingProjects = await Project.find({ userId: req.user.id });
    if (existingProjects.length >= 4) {
      return res.status(400).json({ message: "Maximum 4 projects allowed" });
    }

    const newProject = new Project({
      title: req.body.title,
      description: req.body.description,
      userId: req.user.id,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update a project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
