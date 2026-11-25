const express = require('express');
const mongoose = require('mongoose');
const Task = require('./module.task');

const router = express.Router();

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, status, dueDate, userId } = req.body;

    // Input Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
    }

    const allowedStatuses = ['pending', 'in-progress', 'done'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be pending, in-progress, or done.' });
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Invalid dueDate format.' });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'A valid userId is required.' });
    }

    // Create and save task
    const newTask = new Task({
      title: title.trim(),
      status,
      dueDate,
      userId,
    });

    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


// GET /api/tasks?page=1&limit=10&status=done
router.get('/', async (req, res) => {
  try {
    // Parse pagination parameters with defaults
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) {
      const allowedStatuses = ['pending', 'in-progress', 'done'];
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({ error: 'Invalid status filter.' });
      }
      filter.status = req.query.status;
    }

    // Execute query and count total matching documents in parallel
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page,
      limit,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;