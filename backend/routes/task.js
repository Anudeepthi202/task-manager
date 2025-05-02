const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

// ✅ Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, projectId, completedAt } = req.body;

    const task = new Task({
      title,
      description,
      status,
      projectId,
      user: req.user.id, // 🔥 Link task to the logged-in user
      createdAt: new Date(),
      completedAt: completedAt ? new Date(completedAt) : null,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ✅ Get all tasks for a specific project

router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate("user", "name email country");

    console.log("Fetched Tasks →", tasks); // 👈 Log the populated data

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found for this project" });
    }

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});



// ✅ Update a task
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updates = { ...req.body };

    if (status && status.toLowerCase() === "completed") {
      updates.completedAt = new Date();
    }

    console.log("PUT /api/tasks/:id →", req.params.id, updates);

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ✅ Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("DELETE /api/tasks/:id →", req.params.id);

    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
