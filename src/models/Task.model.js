import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    acceptanceCriteria: {
      type: String,
      required: [true, 'Acceptance criteria is required'],
      trim: true,
      maxlength: [2000, 'Acceptance criteria cannot exceed 2000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null, // null means it's a task, not a subtask
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['new', 'todo', 'inprogress', 'testing', 'done', 'block', 'wont-done'],
      default: 'new',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignee is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get comments for this task
taskSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'task',
  options: { sort: { createdAt: -1 } },
});

// Virtual to get subtasks
taskSchema.virtual('subtasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'parentTask',
  options: { sort: { createdAt: -1 } },
});

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ parentTask: 1 });
taskSchema.index({ createdBy: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
