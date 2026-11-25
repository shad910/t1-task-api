const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'done'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;